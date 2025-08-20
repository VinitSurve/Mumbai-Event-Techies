// src/lib/scrapers/unstop.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class UnstopScraper extends BaseScraper {
  platform: string;

  constructor(page: any) {
    super(page);
    this.platform = 'Unstop';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      
      this.url = url;
      
      console.log('Navigating to Unstop URL...');
      
      try {
        await this.page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10)
        });
        
        await sleep(3000);
        console.log('Initial page load complete, waiting for content...');
        
        await this.page.evaluate(() => {
          window.scrollBy(0, 500);
          setTimeout(() => { window.scrollBy(0, 1000); }, 500);
          setTimeout(() => { window.scrollBy(0, 1000); }, 1000);
        });
        
        await sleep(3000);
      } catch (err) {
        console.error(`Navigation issue: ${(err as Error).message}`);
      }
      
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      const eventData = await this.page.evaluate(() => {
        const data: any = {};
        
        const findElementsByText = (text: string, selector = '*') => {
          const elements = Array.from(document.querySelectorAll(selector));
          return elements.filter(el => el.textContent && el.textContent.includes(text));
        };
        
        const titleElement = document.querySelector('h1');
        if (titleElement) {
          data.title = titleElement.textContent?.trim();
        } else {
          const metaTitle = document.querySelector('meta[property="og:title"]');
          if (metaTitle) {
            data.title = metaTitle.getAttribute('content');
          } else {
            data.title = document.title;
          }
        }
        
        data.description = '';
        
        const descriptionSections = [
          ...findElementsByText('About this event'),
          ...findElementsByText('Everything you need to know'),
          ...findElementsByText('Details')
        ];
        
        if (descriptionSections.length > 0) {
          for (const section of descriptionSections) {
            const parent = section.parentElement;
            if (parent) {
              const nextSibling = parent.nextElementSibling;
              if (nextSibling && nextSibling.textContent && nextSibling.textContent.trim().length > 100) {
                data.description = nextSibling.textContent.trim();
                break;
              }
              
              const container = parent.closest('section, div.container, div.wrapper');
              if (container) {
                const paragraphs = container.querySelectorAll('p, div.description');
                for (const p of paragraphs) {
                  if (p.textContent && p.textContent.trim().length > 100) {
                    data.description = p.textContent.trim();
                    break;
                  }
                }
                
                if (data.description) break;
              }
            }
          }
        }
        
        if (!data.description) {
          const paragraphs = document.querySelectorAll('p, div.description');
          for (const p of paragraphs) {
            const textContent = p.textContent;
            if (textContent && textContent.trim().length > 150) {
              data.description = textContent.trim();
              break;
            }
          }
        }
        
        data.startDateStr = '';
        data.endDateStr = '';
        
        const dateElements = [
          ...findElementsByText('Start:'),
          ...findElementsByText('End:'),
          ...findElementsByText('Dates & Deadlines')
        ];
        
        for (const dateEl of dateElements) {
          const text = dateEl.textContent?.trim();
          if (text) {
            const datePattern = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{2}(?:,\s+\d{1,2}:\d{2}\s+[AP]M\s+[A-Z]{3})?)/g;
            const matches = text.match(datePattern);
            
            if (matches) {
              if (!data.startDateStr && matches.length > 0) {
                data.startDateStr = matches[0];
              }
              
              if (matches.length > 1) {
                data.endDateStr = matches[matches.length - 1];
              }
            }
          }
        }
        
        if (!data.startDateStr || !data.endDateStr) {
          const bodyText = document.body.textContent;
          if (bodyText) {
            const datePattern = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{2}(?:,\s+\d{1,2}:\d{2}\s+[AP]M\s+[A-Z]{3})?)/g;
            const matches = bodyText.match(datePattern);
            
            if (matches) {
              if (!data.startDateStr && matches.length > 0) {
                data.startDateStr = matches[0];
              }
              
              if (!data.endDateStr && matches.length > 1) {
                data.endDateStr = matches[matches.length - 1];
              }
            }
          }
        }
        
        data.location = '';
        data.fullAddress = '';
        
        const locationElements = [
          ...findElementsByText('Location:'),
          ...findElementsByText('Venue:'),
          ...findElementsByText('Where:')
        ];
        
        for (const locationEl of locationElements) {
          const parent = locationEl.parentElement;
          if (parent) {
            if (locationEl.textContent?.includes(':')) {
              const locationText = locationEl.textContent.split(':')[1].trim();
              if (locationText.length > 3) {
                data.location = locationText;
                data.fullAddress = locationText;
                break;
              }
            }
            
            const nextSibling = parent.nextElementSibling;
            if (nextSibling) {
              const locationText = nextSibling.textContent?.trim();
              if (locationText && locationText.length > 3) {
                data.location = locationText;
                data.fullAddress = locationText;
                break;
              }
            }
          }
        }
        
        if (!data.location) {
          const addressElements = document.querySelectorAll('address');
          if (addressElements.length > 0) {
            data.location = addressElements[0].textContent?.trim();
            data.fullAddress = addressElements[0].textContent?.trim();
          }
        }
        
        if (!data.location) {
          const bodyText = document.body.textContent;
          if (bodyText) {
            const venueMatch = bodyText.match(/(?:venue|location|where|address):\s*([^,]+,\s*[^,]+,\s*[^,]+)/i);
            if (venueMatch) {
                data.location = venueMatch[1].trim();
                data.fullAddress = venueMatch[1].trim();
            }
          }
        }
        
        data.organizer = '';
        
        const organizerElements = [
          ...findElementsByText('Organizer'),
          ...findElementsByText('Hosted by'),
          ...document.querySelectorAll('.organizer, .host')
        ];
        
        for (const organizerEl of organizerElements) {
          if (organizerEl.tagName === 'IMG') {
            const alt = organizerEl.getAttribute('alt');
            if (alt && alt.length > 1) {
              data.organizer = alt;
              break;
            }
          } else {
            const organizerText = organizerEl.textContent?.trim();
            
            if (organizerText?.includes(':')) {
              data.organizer = organizerText.split(':')[1].trim();
              break;
            } else if (organizerText?.includes('Organizer') || organizerText?.includes('Hosted by')) {
              const parent = organizerEl.parentElement;
              if (parent) {
                const siblings = parent.children;
                for (const sibling of siblings) {
                  if (sibling !== organizerEl && sibling.textContent && sibling.textContent.trim().length > 0) {
                    data.organizer = sibling.textContent.trim();
                    break;
                  }
                }
              }
            } else if (organizerEl.classList.contains('organizer') || organizerEl.classList.contains('host')) {
              data.organizer = organizerText;
              break;
            }
          }
        }
        
        if (!data.organizer) {
          const metaPublisher = document.querySelector('meta[property="og:site_name"]');
          if (metaPublisher) {
            data.organizer = metaPublisher.getAttribute('content');
          }
        }
        
        if (!data.organizer) {
          data.organizer = window.location.hostname.replace('www.', '').split('.')[0];
          data.organizer = data.organizer.charAt(0).toUpperCase() + data.organizer.slice(1);
        }
        
        data.eventType = '';
        
        const eventTypes = ['Hackathon', 'Coding Challenge', 'Workshop', 'Conference', 'Webinar', 'Competition'];
        for (const type of eventTypes) {
          const typeElements = findElementsByText(type);
          if (typeElements.length > 0) {
            data.eventType = type;
            break;
          }
        }
        
        if (!data.eventType) {
          data.eventType = 'Event';
        }
        
        data.price = 'Unknown';
        data.registrationType = 'Registration Required';
        
        const freeTexts = findElementsByText('Free');
        for (const element of freeTexts) {
          if (element.textContent && element.textContent.trim().length < 10) {
            data.price = 'Free';
            break;
          }
        }
        
        const regFeeElements = findElementsByText('Registration Fee');
        for (const element of regFeeElements) {
          const text = element.textContent;
          if (text) {
            const feeMatch = text.match(/(?:Registration Fee|Fee)[:\\s]*([₹$€£]\\s*[\\d,]+)/i);
            if (feeMatch) {
                data.price = feeMatch[1].trim();
                break;
            }
          }
        }
        
        if (data.price === 'Unknown') {
          const bodyText = document.body.textContent;
          if (bodyText) {
            const feePattern = /(?:Registration Fee|Fee)[:\\s]*([₹$€£]\\s*[\\d,]+)/i;
            const feeMatch = bodyText.match(feePattern);
            if (feeMatch) {
                data.price = feeMatch[1].trim();
            }
          }
        }
        
        data.cashPrize = '';
        
        const prizeElements = [
          ...findElementsByText('Prize'),
          ...findElementsByText('Total Prize'),
          ...findElementsByText('Prize pool'),
          ...findElementsByText('Prizes worth')
        ];
        
        for (const element of prizeElements) {
          const text = element.textContent;
          if (text) {
            const prizeMatch = text.match(/([₹$€£]\\s*[\\d,]+(?:\\s*lakhs?)?)/i);
            if (prizeMatch) {
                data.cashPrize = prizeMatch[1].trim();
                break;
            }
            
            const worthMatch = text.match(/worth\\s+([₹$€£]\\s*[\\d,]+(?:\\s*lakhs?)?)/i);
            if (worthMatch) {
                data.cashPrize = worthMatch[1].trim();
                break;
            }
            
            const numericMatch = text.match(/([\\d,]+)/);
            if (numericMatch && element.textContent?.toLowerCase().includes('prize')) {
                const amountStr = numericMatch[1].trim();
                data.cashPrize = '₹' + amountStr;
                break;
            }
          }
        }
        
        if (!data.cashPrize) {
          const bodyText = document.body.textContent;
          if (bodyText) {
            const prizePatterns = [
                /prizes?\\s+worth\\s+([₹$€£]\\s*[\\d,]+(?:\\s*lakhs?)?)/i,
                /total\\s+prize\\s+([₹$€£]\\s*[\\d,]+(?:\\s*lakhs?)?)/i,
                /prize\\s+pool\\s+of\\s+([₹$€£]\\s*[\\d,]+(?:\\s*lakhs?)?)/i,
                /cash\\s+prizes?:\\s*([₹$€£]\\s*[\\d,]+(?:\\s*lakhs?)?)/i
            ];
            
            for (const pattern of prizePatterns) {
                const match = bodyText.match(pattern);
                if (match) {
                data.cashPrize = match[1].trim();
                break;
                }
            }
          }
        }
        
        data.tags = [];
        
        const tagSections = [
          ...findElementsByText('Tags:'),
          ...findElementsByText('Categories:'),
          ...findElementsByText('Topics:'),
          ...findElementsByText('Key Themes:')
        ];
        
        for (const section of tagSections) {
          const parent = section.parentElement;
          if (parent) {
            const tagElements = parent.querySelectorAll('span.tag, a.tag, .badge, .chip');
            if (tagElements.length > 0) {
              for (const tag of tagElements) {
                const tagText = tag.textContent?.trim();
                if (tagText && tagText.length > 1) {
                  data.tags.push(tagText.toLowerCase());
                }
              }
            }
            
            if (data.tags.length === 0) {
              const nextSibling = parent.nextElementSibling;
              if (nextSibling) {
                const tagText = nextSibling.textContent?.trim();
                if (tagText) {
                    const tagArray = tagText.split(/,|;|\|/).map(t => t.trim().toLowerCase());
                    data.tags = tagArray.filter(t => t.length > 1);
                }
              }
            }
            
            if (data.tags.length > 0) break;
          }
        }
        
        if (data.tags.length === 0) {
          const commonTags = ['tech', 'coding', 'hackathon', 'innovation', 'competition', 'challenge', 'ai', 'machine learning', 'data science', 'web', 'mobile', 'blockchain', 'cloud', 'iot'];
          
          for (const tag of commonTags) {
            const pageText = (data.title?.toLowerCase() || '') + ' ' + (data.description?.toLowerCase() || '');
            if (pageText.includes(tag)) {
              data.tags.push(tag);
            }
          }
          
          if (data.eventType && data.eventType !== 'Event') {
            data.tags.push(data.eventType.toLowerCase());
          }
        }
        
        data.imageUrl = '';
        
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
          data.imageUrl = ogImage.getAttribute('content');
        } else {
          const images: NodeListOf<HTMLImageElement> = Array.from(document.querySelectorAll('img')).filter(img => {
            const src = img.getAttribute('src');
            const width = img.offsetWidth;
            const height = img.offsetHeight;
            return src && width > 200 && height > 150 && !src.includes('logo');
          }) as NodeListOf<HTMLImageElement>;
          
          if (images.length > 0) {
            data.imageUrl = images[0].getAttribute('src');
          }
        }
        
        return data;
      });
      
      let startDate = null;
      let endDate = null;
      
      if (eventData.startDateStr) {
        startDate = this.parseUnstopDate(eventData.startDateStr);
      }
      
      if (eventData.endDateStr) {
        endDate = this.parseUnstopDate(eventData.endDateStr);
      }
      
      const event: Partial<Event> & { [key: string]: any } = {
        title: sanitizeString(eventData.title) || 'Unknown',
        description: sanitizeString(eventData.description, 5000) || 'No description available',
        event_date: startDate ? startDate.toISOString() : new Date().toISOString(),
        location: sanitizeString(eventData.location) || 'Online',
        image_url: eventData.imageUrl || '',
        urls: [url],
        category: 'Hackathon'
      };
      
      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping Unstop event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Unstop event: ${(err as Error).message}`);
    }
  }
  
  parseUnstopDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    try {
      const formats = [
        'DD MMM YY, hh:mm A Z',
        'DD MMM YY, hh:mm A',
        'DD MMM YY',
        'D MMM YY, hh:mm A Z',
        'D MMM YY, hh:mm A',
        'D MMM YY'
      ];
      
      for (const format of formats) {
        const parsedDate = moment(dateStr, format);
        if (parsedDate.isValid()) {
          return parsedDate.toDate();
        }
      }
      
      const directParsed = moment(dateStr);
      if (directParsed.isValid()) {
        return directParsed.toDate();
      }
    } catch (error: any) {
      console.error(`Error parsing date '${dateStr}':`, error);
    }
    
    return null;
  }
}
