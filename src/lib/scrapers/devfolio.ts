// src/lib/scrapers/devfolio.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class DevfolioScraper extends BaseScraper {
  platform: string;

  constructor() {
    super();
    this.platform = 'Devfolio';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      this.url = url;
      
      console.log('Navigating to Devfolio URL...');
      
      try {
        await this.page!.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10)
        });
        await sleep(3000);
        console.log('Initial page load complete, waiting for content...');
        await this.page!.evaluate(() => {
          window.scrollBy(0, 500);
        });
        await sleep(3000);
      } catch (err) {
        console.error(`Navigation issue: ${(err as Error).message}`);
      }
      
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      const eventData = await this.page!.evaluate(() => {
        const data: any = {};
        const findElementsByText = (text: string, selector = '*') => {
          const elements = Array.from(document.querySelectorAll(selector));
          return elements.filter(el => el.textContent && el.textContent.includes(text));
        };
        
        const titleSelectors = ['h1', '[data-testid="event-title"]', '.hackathon-title', '.event-title'];
        for (const selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.title = el.textContent?.trim();
            break;
          }
        }
        if (!data.title) {
            data.title = document.title.replace(' - Devfolio', '').trim();
        }

        const overviewSelectors = ['.event-description', '.hackathon-description', '.overview', '#overview', '[data-testid="event-description"]'];
        for (const selector of overviewSelectors) {
            const el = document.querySelector(selector);
            if(el) {
                data.description = el.textContent?.trim();
                if(data.description && data.description.length > 100) break;
            }
        }

        const dateSelectors = ['.event-date', '.hackathon-date', '.date-info', '[data-testid="event-date"]'];
        for (const selector of dateSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const dateText = el.textContent?.trim();
            if (dateText) {
              if (dateText.includes('-')) {
                const [start, end] = dateText.split('-').map(d => d.trim());
                data.startDateStr = start;
                data.endDateStr = end;
              } else {
                data.startDateStr = dateText;
              }
              break;
            }
          }
        }
        
        const locationElements = findElementsByText('Happening');
        if (locationElements.length > 0) {
            const text = locationElements[0].textContent;
            const match = text?.match(/Happening\s+(.*)/i);
            if (match && match[1]) {
                data.location = match[1].trim();
            }
        }
        if (!data.location) data.location = 'Online';


        const imageSelectors = ['.event-image img', '.event-banner img', '.hackathon-banner img', '.banner img', '[data-testid="event-image"] img'];
        for (const selector of imageSelectors) {
            const el = document.querySelector(selector) as HTMLImageElement;
            if (el && el.src) {
                data.imageUrl = el.src;
                data.coverImageUrl = el.src;
                break;
            }
        }
        
        return data;
      });

      let startDate = null;
      if (eventData.startDateStr) {
        startDate = moment(eventData.startDateStr, [
          'MMM D, YYYY', 'MMMM D, YYYY', 'MMM DD, YYYY', 'MMMM DD, YYYY', 'D MMM YYYY', 'DD MMM YYYY'
        ]);
        if (!startDate.isValid()) startDate = null;
      }
      
      let endDate = null;
      if (eventData.endDateStr) {
        endDate = moment(eventData.endDateStr, [
          'MMM D, YYYY', 'MMMM D, YYYY', 'MMM DD, YYYY', 'MMMM DD, YYYY', 'D MMM YYYY', 'DD MMM YYYY'
        ]);
        if (!endDate.isValid() && startDate && /^\d{1,2}$/.test(eventData.endDateStr.trim())) {
          const day = parseInt(eventData.endDateStr.trim(), 10);
          endDate = moment(startDate).date(day);
        }
        if (!endDate.isValid()) endDate = null;
      }

      const normalizedEvent = {
        title: sanitizeString(eventData.title) || 'Unknown',
        description: sanitizeString(eventData.description, 5000) || 'No description available',
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        location: sanitizeString(eventData.location) || 'Unknown',
        organizer: sanitizeString(eventData.organizer) || 'Devfolio',
        imageUrl: eventData.imageUrl || '',
        coverImageUrl: eventData.coverImageUrl || eventData.imageUrl || '',
        url: this.url,
      };

      return this.normalizeEventData(normalizedEvent, url);
    } catch (err) {
      console.error(`Error scraping Devfolio event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Devfolio event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }
}
