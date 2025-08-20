// src/lib/scrapers/bevy.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class BevyScraper extends BaseScraper {
  platform: string;

  constructor(page: any) {
    super(page);
    this.platform = 'Bevy';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      this.url = url;
      
      console.log('Navigating to Bevy URL...');

      try {
        await this.page!.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10)
        });
        
        await sleep(3000);
        console.log('Initial page load complete, waiting for content...');
        
        await this.page!.evaluate(() => {
          window.scrollBy(0, 500);
          setTimeout(() => { window.scrollBy(0, 500); }, 500);
        });
        
        await sleep(3000);
      } catch (err) {
        console.error(`Navigation issue: ${(err as Error).message}`);
      }
      
      try {
        console.log('Waiting for event title...');
        await Promise.race([
          this.page!.waitForSelector('h1', { timeout: 10000 }),
          this.page!.waitForSelector('.event-title', { timeout: 10000 }),
          this.page!.waitForSelector('.event-name', { timeout: 10000 })
        ]);
        console.log('Found event title element');
      } catch (err) {
        console.log('Could not find specific event title element, will try alternative selectors');
      }
      
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      let snapBevyData: any = {};
      if (url.includes('snap.bevy.com')) {
        console.log('Detected Snap Bevy event, extracting specialized data...');
        snapBevyData = await this.extractSnapBevyData();
      }
      
      const eventData = await this.page!.evaluate(() => {
        const data: any = {};
        
        const findElementWithText = (text: string, tagNames = ['p', 'div', 'span', 'h1', 'h2', 'h3']) => {
          for (const tag of tagNames) {
            const elements = document.querySelectorAll(tag);
            for (const el of elements) {
              if (el.textContent && el.textContent.includes(text)) {
                return el;
              }
            }
          }
          return null;
        };
        
        const titleSelectors = ['h1', '.event-title', '.event-name', '.event-heading', '.title', '[data-testid="event-title"]'];
        for (const selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.title = el.textContent?.trim();
            break;
          }
        }
        
        const descriptionSelectors = ['.event-description', '.description', '[data-testid="event-description"]', '.about-event', '.details', '.content'];
        for (const selector of descriptionSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length) {
            data.description = Array.from(elements).map(el => el.textContent?.trim()).join('\n\n');
            break;
          }
        }
        
        if (!data.description) {
            const mainContentSelectors = ['main', '[role="main"]', '.event-content', '.content-area'];
            for (const selector of mainContentSelectors) {
                const mainElement = document.querySelector(selector);
                if (mainElement) {
                    const paragraphs = mainElement.querySelectorAll('p');
                    if (paragraphs.length > 0) {
                        data.description = Array.from(paragraphs).map(p => p.textContent?.trim()).filter(text => text && text.length > 20).join('\n\n');
                    }
                }
            }
        }

        const dateSelectors = ['.event-date', '.date', '.time', '.event-time', '[data-testid="event-date"]', '[data-testid="event-time"]', 'time', '[datetime]', '[data-event-start-date]', '[data-event-end-date]'];
        const dateNodes = document.querySelectorAll('[data-event-start-date], [data-event-end-date], [data-start-date], [data-end-date]');
        if (dateNodes.length > 0) {
          for (const node of dateNodes) {
            if (node.getAttribute('data-event-start-date') || node.getAttribute('data-start-date')) {
              data.startDateStr = node.getAttribute('data-event-start-date') || node.getAttribute('data-start-date');
            }
            if (node.getAttribute('data-event-end-date') || node.getAttribute('data-end-date')) {
              data.endDateStr = node.getAttribute('data-event-end-date') || node.getAttribute('data-end-date');
            }
          }
        }
        
        if (!data.startDateStr) {
          for (const selector of dateSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              data.startDateStr = el.getAttribute('datetime') || el.textContent?.trim();
              break;
            }
          }
        }

        const locationSelectors = ['.event-location', '.location', '.venue', '.event-venue', '[data-testid="event-location"]', '[data-testid="event-venue"]', '[data-location]', '[data-venue]'];
        for (const selector of locationSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                data.location = el.textContent?.trim();
                break;
            }
        }

        const organizerSelectors = ['.event-organizer', '.organizer', '.host', '.event-host', '[data-testid="event-organizer"]', '[data-testid="event-host"]', '[data-organizer]', '.community-name', '.group-name'];
        for (const selector of organizerSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                data.organizer = el.textContent?.trim();
                break;
            }
        }

        const imageSelectors = ['.event-image img', '.event-cover img', '.banner img', '.cover-photo img', '.event-banner img', '.event-header img'];
        for (const selector of imageSelectors) {
          const el = document.querySelector(selector);
          if (el && el.getAttribute('src')) {
            data.imageUrl = el.getAttribute('src');
            data.coverImageUrl = el.getAttribute('src');
            break;
          }
        }

        if (!data.imageUrl) {
            const allImages = document.querySelectorAll('img');
            let largestArea = 0;
            let largestImg = null;
            for (const img of allImages) {
                const area = img.width * img.height;
                if (area > largestArea && img.width > 200) {
                    largestArea = area;
                    largestImg = img;
                }
            }
            if (largestImg) {
                data.imageUrl = largestImg.getAttribute('src');
                data.coverImageUrl = largestImg.getAttribute('src');
            }
        }
        
        return data;
      });
      
      console.log('Raw event data:', JSON.stringify(eventData));
      
      let additionalData: any = {};
      const jsonLdData = structuredData.filter(data => data['@type'] === 'Event' || (data['@graph'] && data['@graph'].some((item: any) => item['@type'] === 'Event')));
      if (jsonLdData.length > 0) {
        let eventObject = jsonLdData[0];
        if (eventObject['@graph']) {
            eventObject = eventObject['@graph'].find((item: any) => item['@type'] === 'Event');
        }
        if (eventObject) {
            additionalData = {
                title: eventObject.name,
                description: eventObject.description,
                startDateStr: eventObject.startDate,
                endDateStr: eventObject.endDate,
                imageUrl: eventObject.image,
                location: eventObject.location?.name || (typeof eventObject.location === 'string' ? eventObject.location : null),
                organizer: eventObject.organizer?.name || (typeof eventObject.organizer === 'string' ? eventObject.organizer : null),
            };
        }
      }
      
      const mergedData = { ...additionalData, ...eventData, ...snapBevyData };
      
      let parsedStartDate = mergedData.startDateStr ? moment(mergedData.startDateStr) : null;
      if (parsedStartDate && !parsedStartDate.isValid()) parsedStartDate = null;

      let parsedEndDate = mergedData.endDateStr ? moment(mergedData.endDateStr) : null;
      if(parsedEndDate && !parsedEndDate.isValid()) parsedEndDate = null;

      const event: any = {
        title: sanitizeString(mergedData.title, 255) || 'Unknown',
        description: sanitizeString(mergedData.description, 5000) || 'No description available',
        startDate: parsedStartDate ? parsedStartDate.toISOString() : null,
        endDate: parsedEndDate ? parsedEndDate.toISOString() : null,
        location: sanitizeString(mergedData.location) || 'Unknown',
        organizer: sanitizeString(mergedData.organizer) || 'Unknown',
        imageUrl: mergedData.imageUrl || '',
        coverImageUrl: mergedData.coverImageUrl || mergedData.imageUrl || '',
      };
      
      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping Bevy event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Bevy event: ${(err as Error).message}`);
    }
  }

  async extractSnapBevyData(): Promise<any> {
    if (!this.page) return {};
    try {
      return await this.page.evaluate(() => {
        const data: any = {};
        
        const title = document.querySelector('h1');
        if (title) {
          data.title = title.textContent?.trim();
        }
        
        const whenSection = Array.from(document.querySelectorAll('h3, h4, div, p')).find(el => el.textContent?.trim() === 'When');
        if (whenSection) {
          const dateContainer = whenSection.nextElementSibling || whenSection.parentElement;
          if (dateContainer) {
            const dateText = dateContainer.textContent?.trim();
            const dateMatch = dateText?.match(/([A-Za-z]+,?\s+[A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
            const startTimeMatch = dateText?.match(/(\d{1,2}:\d{2}\s*[APM]{2})/);
            const endTimeMatch = dateText?.match(/–\s*(\d{1,2}:\d{2}\s*[APM]{2})/);
            
            if (dateMatch) {
              data.startDateStr = dateMatch[1];
              if (startTimeMatch) data.startDateStr += ' ' + startTimeMatch[1];
            }
            
            if (dateMatch && endTimeMatch) {
              data.endDateStr = dateMatch[1] + ' ' + endTimeMatch[1];
            }
          }
        }
        
        const whereSection = Array.from(document.querySelectorAll('h3, h4, div, p')).find(el => el.textContent?.trim() === 'Where');
        if (whereSection) {
          const locationContainer = whereSection.nextElementSibling || whereSection.parentElement;
          if (locationContainer) {
            data.location = locationContainer.textContent?.trim();
          }
        }
        
        const hostSection = Array.from(document.querySelectorAll('h3, h4, div, p')).find(el => el.textContent?.trim() === 'Host');
        if (hostSection) {
          const hostContainer = hostSection.nextElementSibling || hostSection.parentElement;
          if (hostContainer) {
            data.organizer = hostContainer.textContent?.trim().split('\n')[0].trim();
          }
        }
        
        return data;
      });
    } catch (err) {
      console.error('Error extracting Snap Bevy data:', (err as Error).message);
      return {};
    }
  }
}
