{// src/lib/scrapers/hack2skill.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class Hack2SkillScraper extends BaseScraper {
  platform: string;

  constructor() {
    super();
    this.platform = 'Hack2Skill';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      if (!this.page) throw new Error('Page not initialized');

      this.url = url;
      
      console.log('Navigating to Hack2Skill URL...');
      
      try {
        await this.page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10)
        });
        
        await sleep(3000);
        console.log('Initial page load complete, waiting for content...');
        
        await this.page.evaluate(() => {
          window.scrollBy(0, 500);
          setTimeout(() => { window.scrollBy(0, 500); }, 500);
        });
        
        await sleep(2000);
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
        
        data.title = '';
        const titleSelectors = ['h1', '.event-title', '.hackathon-title', '.page-title'];
        
        for (const selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.title = el.textContent?.trim();
            break;
          }
        }
        
        if (!data.title) {
          data.title = document.title;
        }
        
        data.description = '';
        const overviewElements = findElementsByText('Overview');
        if (overviewElements.length > 0) {
          const overviewEl = overviewElements[0];
          const parent = overviewEl.parentElement;
          
          if (parent) {
            let sibling = parent.nextElementSibling;
            if (sibling) {
              data.description = sibling.textContent?.trim();
            }
            
            if (!data.description && parent.parentElement) {
              sibling = parent.parentElement.nextElementSibling;
              if (sibling) {
                data.description = sibling.textContent?.trim();
              }
            }
          }
        }
        
        if (!data.description) {
          const paragraphs = document.querySelectorAll('p');
          for (const p of paragraphs) {
            const text = p.textContent?.trim();
            if (text && text.length > 100) {
              data.description = text;
              break;
            }
          }
        }
        
        data.startDateStr = '';
        data.endDateStr = '';
        
        const timelineElements = findElementsByText('Timeline');
        if (timelineElements.length > 0) {
          const dateElements = findElementsByText('20', 'div, span, p');
          for (const dateEl of dateElements) {
            const text = dateEl.textContent?.trim();
            if(text) {
                const dateMatch = text.match(/(\w+\s+\d{1,2},?\s+\d{4})/);
                if (dateMatch) {
                if (!data.startDateStr) {
                    data.startDateStr = dateMatch[1];
                } else {
                    data.endDateStr = dateMatch[1];
                    break;
                }
                }
            }
          }
        }
        
        if (!data.endDateStr) {
          const bodyText = document.body.textContent;
          if (bodyText) {
            const dateMatches = bodyText.match(/(\w+\s+\d{1,2},?\s+\d{4})/g) || [];
            if (dateMatches.length >= 2) {
                if (!data.startDateStr) {
                data.startDateStr = dateMatches[0];
                }
                data.endDateStr = dateMatches[dateMatches.length - 1];
            }
          }
        }
        
        data.location = 'Online';
        
        const bodyText = document.body.textContent;
        if (bodyText && bodyText.match(/\bonline\b/i)) {
          data.location = 'Online';
        }
        
        const venueElements = findElementsByText('Venue');
        if (venueElements.length > 0) {
          const venueEl = venueElements[0];
          const parent = venueEl.parentElement;
          
          if (parent) {
            const sibling = parent.nextElementSibling;
            if (sibling) {
              data.location = sibling.textContent?.trim();
            }
          }
        }
        
        data.organizer = 'Hack2Skill';
        
        const hostElements = findElementsByText('Host', 'h1, h2, h3, h4, h5');
        if (hostElements.length > 0) {
          const hostEl = hostElements[0];
          const parent = hostEl.parentElement;
          
          if (parent) {
            const sibling = parent.nextElementSibling;
            if (sibling) {
              data.organizer = sibling.textContent?.trim();
            }
          }
        }
        
        data.eventType = 'Hackathon';
        
        if (bodyText && bodyText.match(/\bwebinar\b/i)) {
          data.eventType = 'Webinar';
        }
        
        data.registrationType = '';
        
        const registerElements = document.querySelectorAll('a[href*="register"], button');
        for (const el of registerElements) {
          if (el.textContent && el.textContent.toLowerCase().includes('register')) {
            data.registrationType = 'Registration Required';
            break;
          }
        }
        
        data.price = '';
        data.cashPrize = '';
        
        if (bodyText && bodyText.match(/\bfree\b/i)) {
          data.price = 'Free';
        }
        
        if(bodyText) {
            const feeMatch = bodyText.match(/registration fee:?\s*([₹$€£])\s*(\d+[\d,.]*)/i);
            if (feeMatch) {
                data.price = feeMatch[0].replace(/registration fee:?/i, '').trim();
            }
        }
        
        const cashPrizeElements = findElementsByText('prize', 'h1, h2, h3, p, div');
        for (const element of cashPrizeElements) {
          const text = element.textContent?.trim();
          if (text) {
            const cashMatch = text.match(/([₹$€£]\s*\d+[\d,.]*\s*(lakhs?|crores?)?)/i);
            if (cashMatch) {
                data.cashPrize = cashMatch[0].trim();
                break;
            }
          }
        }
        
        if (!data.cashPrize && bodyText) {
          const prizePatterns = [
            /prize\s*worth\s*([₹$€£]\s*\d+[\d,.]*\s*(lakhs?|crores?)?)/i,
            /cash\s*prize\s*worth\s*([₹$€£]\s*\d+[\d,.]*)/i,
            /total\s*cash\s*prize\s*worth\s*([₹$€£]\s*\d+[\d,.]*)/i,
            /prizes?\s*worth\s*([₹$€£]\s*\d+[\d,.]*)/i,
            /([₹$€£]\s*\d+[\d,.]*\s*lakhs?)/i
          ];
          
          for (const pattern of prizePatterns) {
            const match = bodyText.match(pattern);
            if (match) {
              data.cashPrize = match[0].trim();
              break;
            }
          }
        }
        
        return data;
      });
      
      console.log('Raw event data:', JSON.stringify(eventData));
      
      let startDate = null;
      let endDate = null;
      
      if (eventData.startDateStr) {
        startDate = this.parseFlexibleDate(eventData.startDateStr);
      }
      
      if (eventData.endDateStr) {
        endDate = this.parseFlexibleDate(eventData.endDateStr);
      }
      
      const event: Partial<Event> & { [key: string]: any } = {
        title: sanitizeString(eventData.title) || 'Unknown',
        description: sanitizeString(eventData.description, 5000) || 'No description available',
        event_date: startDate ? startDate.toISOString() : new Date().toISOString(),
        location: sanitizeString(eventData.location) || 'Online',
        organizer: sanitizeString(eventData.organizer) || 'Hack2Skill',
        image_url: metadata['og:image'] || '',
        urls: [url],
        category: 'Hackathon'
      };
      
      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping Hack2Skill event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Hack2Skill event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }
  
  parseFlexibleDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    try {
      let parsedDate = moment(dateStr);
      
      if (!parsedDate.isValid()) {
        const formats = [
          'MMMM D, YYYY',
          'MMM D, YYYY',
          'MMMM DD, YYYY',
          'MMM DD, YYYY',
          'D MMMM, YYYY',
          'DD MMMM, YYYY',
          'D MMM, YYYY',
          'DD MMM, YYYY',
          'YYYY-MM-DD'
        ];
        
        for (const format of formats) {
          parsedDate = moment(dateStr, format);
          if (parsedDate.isValid()) break;
        }
      }
      
      return parsedDate.isValid() ? parsedDate.toDate() : null;
    } catch (error: any) {
      console.log('Error parsing date:', error.message);
    }
    
    return null;
  }
}
