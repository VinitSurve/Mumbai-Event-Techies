{// src/lib/scrapers/devpost.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class DevpostScraper extends BaseScraper {
  platform: string;

  constructor() {
    super();
    this.platform = 'Devpost';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      if (!this.page) {
        throw new Error('Page not initialized');
      }
      this.url = url;
      
      console.log('Navigating to Devpost URL...');
      
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
          setTimeout(() => { window.scrollBy(0, 1500); }, 1000);
        });
        
        await sleep(3000);
      } catch (err) {
        console.error(`Navigation issue: ${(err as Error).message}`);
      }
      
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      console.log('Page title:', await this.page.title());
      
      const eventData = await this.page.evaluate(() => {
        const data: any = {};
        
        const findElementsByText = (text: string, selector = '*') => {
          return Array.from(document.querySelectorAll(selector)).filter(el => el.textContent && el.textContent.includes(text));
        };
        
        const titleSelectors = [
          'h1', 
          '.hackathon-title',
          '.challenge-title'
        ];
        
        for (const selector of titleSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            data.title = elements[0].textContent?.trim();
            break;
          }
        }
        
        if (!data.title) {
          data.title = document.title.replace(' - Devpost', '').trim();
        }
        
        data.description = '';
        const overviewSelectors = [
          '.challenge-description',
          '.hackathon-description',
          '.overview',
          '#overview',
          'section p',
          'main p',
          'article p',
          '.content p'
        ];
        
        for (const selector of overviewSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            if (selector.includes('p') && elements.length > 1) {
              const paragraphs = Array.from(elements)
                .map(p => p.textContent?.trim())
                .filter(text => text && text.length > 20);
              
              if (paragraphs.length >= 2) {
                data.description = paragraphs.join('\n\n');
              } else if (paragraphs.length === 1) {
                data.description = paragraphs[0];
              }
            } else {
              data.description = elements[0].textContent?.trim();
            }
            
            if (data.description && data.description.length > 100) {
              break;
            }
          }
        }
        
        if (!data.description || data.description.length < 100) {
          const sectionHeaders = [
            'Welcome to',
            'Requirements',
            'What to Build'
          ];
          
          for (const header of sectionHeaders) {
            const elements = findElementsByText(header);
            if (elements.length > 0) {
              const element = elements[0];
              const parent = element.parentElement;
              
              if (parent) {
                const paragraphs: string[] = [];
                let sibling = parent.nextElementSibling;
                
                while (sibling && paragraphs.join('').length < 1000) {
                  if (sibling.tagName === 'P' || sibling.querySelector('p')) {
                    const text = sibling.textContent?.trim();
                    if (text && text.length > 30) {
                      paragraphs.push(text);
                    }
                  }
                  sibling = sibling.nextElementSibling;
                }
                
                if (paragraphs.length > 0) {
                  data.description = paragraphs.join('\n\n');
                  break;
                }
              }
            }
          }
        }
        
        if (!data.description || data.description.length < 100) {
          const overviewTab = document.querySelector('.tab-content #overview');
          if (overviewTab) {
            const paragraphs = Array.from(overviewTab.querySelectorAll('p'))
              .map(p => p.textContent?.trim())
              .filter(text => text && text.length > 30);
              
            if (paragraphs.length > 0) {
              data.description = paragraphs.join('\n\n');
            }
          }
        }
        
        data.startDateStr = '';
        data.endDateStr = '';
        
        const deadlineElements = findElementsByText('Deadline');
        if (deadlineElements.length > 0) {
          const deadlineEl = deadlineElements[0];
          const container = deadlineEl.closest('div, section');
          
          if (container) {
            const dateText = container.textContent?.replace('Deadline', '').trim();
            if (dateText) {
              data.endDateStr = dateText;
            }
          }
        }
        
        if (!data.endDateStr) {
          const scheduleElements = findElementsByText('View schedule');
          if (scheduleElements.length > 0) {
            const scheduleContainer = scheduleElements[0].closest('div, section');
            if (scheduleContainer) {
              const dateTexts = Array.from(scheduleContainer.querySelectorAll('*'))
                .map(el => el.textContent?.trim())
                .filter(text => text && (
                  /[A-Z][a-z]{2}\s+\d{1,2},?\s+\d{4}/.test(text) ||
                  /\d{1,2}\s+[A-Z][a-z]{2},?\s+\d{4}/.test(text)
                ));
              
              if (dateTexts.length > 0) {
                data.endDateStr = dateTexts[0];
              }
            }
          }
        }
        
        if (!data.endDateStr) {
          const datePatterns = [
            /([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}\s+@\s+[\d:]+(?:am|pm)\s+GMT[+-]\d+(?::\d+)?)/i,
            /([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
            /(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/i
          ];
          
          for (const pattern of datePatterns) {
            const bodyText = document.body.textContent || '';
            const match = bodyText.match(pattern);
            if (match && match[1]) {
              data.endDateStr = match[1].trim();
              break;
            }
          }
        }
        
        data.location = '';
        data.fullAddress = '';
        
        const onlineElements = findElementsByText('Online');
        if (onlineElements.length > 0) {
          data.location = 'Online';
          data.fullAddress = 'Virtual Event';
        } else {
          const venueElements = findElementsByText('Venue details');
          if (venueElements.length > 0) {
            const venueContainer = venueElements[0].closest('div, section');
            if (venueContainer) {
              const textNodes = Array.from(venueContainer.querySelectorAll('*'))
                .filter(el => !el.querySelector('*'))
                .map(el => el.textContent?.trim())
                .filter(text => text && text.length > 0);
              
              if (textNodes.length > 0) {
                data.location = textNodes[0];
                data.fullAddress = textNodes.join(', ');
              }
            }
          }
        }
        
        if (!data.location) {
          const bodyText = document.body.textContent || '';
          if (bodyText.includes('Virtual') || bodyText.includes('virtual event') || bodyText.includes('remotely')) {
            data.location = 'Online';
            data.fullAddress = 'Virtual Event';
          }
        }
        
        data.prize = '';
        data.cashPrize = '';
        
        const prizePatterns = [
          /\$([\d,]+)\s+in\s+(?:cash|prizes)/i,
          /\$([\d,]+)\s+cash/i,
          /([\d,]+)\s+in\s+cash/i
        ];
        
        for (const pattern of prizePatterns) {
          const bodyText = document.body.textContent || '';
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            const amount = match[1].replace(/,/g, '');
            data.prize = `$${amount}`;
            data.cashPrize = `$${amount}`;
            break;
          }
        }
        
        if (!data.prize) {
          const prizeElements = findElementsByText('Prizes');
          if (prizeElements.length > 0) {
            const prizeContainer = prizeElements[0].closest('div, section');
            if (prizeContainer) {
              const prizeText = prizeContainer.textContent || '';
              const cashMatch = prizeText.match(/\$([\d,]+)/);
              if (cashMatch && cashMatch[1]) {
                data.prize = `$${cashMatch[1]}`;
                data.cashPrize = `$${cashMatch[1]}`;
              }
            }
          }
        }
        
        data.attendeeCount = '';
        const participantPatterns = [
          /(\d+)\s+participants/i,
          /participants\s+\((\d+)\)/i
        ];
        
        for (const pattern of participantPatterns) {
          const bodyText = document.body.textContent || '';
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            data.attendeeCount = match[1];
            break;
          }
        }
        
        data.organizer = '';
        const managedByElements = findElementsByText('Managed by');
        if (managedByElements.length > 0) {
          const container = managedByElements[0].closest('div, section, p');
          if (container) {
            const text = container.textContent?.replace('Managed by', '').trim();
            if (text) {
              data.organizer = text;
            }
          }
        }
        
        if (!data.organizer) {
          const sponsoredByElements = findElementsByText('sponsored by');
          if (sponsoredByElements.length > 0) {
            const text = sponsoredByElements[0].textContent || '';
            const match = text.match(/sponsored\s+by\s+([^,]+)/i);
            if (match && match[1]) {
              data.organizer = match[1].trim();
            }
          }
        }
        
        data.imageUrl = '';
        data.coverImageUrl = '';
        
        const images = document.querySelectorAll('img');
        let largestArea = 0;
        let largestImg: HTMLImageElement | null = null;
        
        for (const img of images) {
          if (img.width > 200 && img.height > 100) {
            const area = img.width * img.height;
            if (area > largestArea && !img.src.includes('logo')) {
              largestArea = area;
              largestImg = img;
            }
          }
        }
        
        if (largestImg && largestImg.src) {
          data.imageUrl = largestImg.src;
          data.coverImageUrl = largestImg.src;
        }
        
        data.tags = [];
        const possibleTags = [
          'AI', 'Machine Learning', 'Open Ended', 'Beginner Friendly',
          'Web', 'Mobile', 'Game', 'Data', 'API', 'IoT', 'AR/VR',
          'Blockchain', 'Social Good', 'Education', 'Health'
        ];
        
        for (const tag of possibleTags) {
          if (document.body.textContent?.includes(tag)) {
            data.tags.push(tag.toLowerCase());
          }
        }
        
        return data;
      });
      
      console.log(`Description extracted: ${eventData.description ? eventData.description.length : 0} characters`);
      if (eventData.description) {
        console.log(`Description preview: ${eventData.description.substring(0, 100)}...`);
      }
      
      let endDate = null;
      if (eventData.endDateStr) {
        endDate = moment(eventData.endDateStr, [
          'MMM D, YYYY @ h:mma Z',
          'MMMM D, YYYY @ h:mma Z',
          'MMM D, YYYY',
          'MMMM D, YYYY',
          'D MMM YYYY',
          'D MMMM YYYY'
        ]);
        
        if (!endDate.isValid()) {
          const dateMatch = eventData.endDateStr.match(/([A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
          if (dateMatch) {
            endDate = moment(dateMatch[1], ['MMM D, YYYY', 'MMMM D, YYYY']);
          }
        }
        
        if (!endDate.isValid()) {
          endDate = null;
        }
      }
      
      let startDate = moment();
      
      const normalizedEvent: {[key: string]: any} = {
        title: sanitizeString(eventData.title) || 'Unknown',
        description: sanitizeString(eventData.description, 5000) || 'No description available',
        event_date: (endDate || startDate).toISOString(),
        location: sanitizeString(eventData.location) || 'Online',
        organizer: sanitizeString(eventData.organizer) || 'Devpost',
        image_url: eventData.imageUrl || '',
        urls: [url],
        category: 'Hackathon',
      };
      
      return this.normalizeEventData(normalizedEvent, url);
    } catch (err) {
      console.error(`Error scraping Devpost event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Devpost event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }
}
