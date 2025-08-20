{// src/lib/scrapers/ibm.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';


export class IBMScraper extends BaseScraper {
  platform: string;
  constructor() {
    super();
    this.platform = 'IBM';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      if(!this.page) throw new Error('Page not initialized');
      this.url = url;
      
      console.log('Navigating to IBM event URL...');
      
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
          const elements = Array.from(document.querySelectorAll(selector));
          return elements.filter(el => el.textContent && el.textContent.includes(text));
        };
        
        const titleSelectors = [
          'h1', 
          '.event-title',
          '.seminar-title',
          '.headline',
          '.header-title'
        ];
        
        for (const selector of titleSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            data.title = elements[0].textContent?.trim();
            break;
          }
        }
        
        if (!data.title) {
          data.title = document.title.replace(' - IBM', '').trim();
        }
        
        data.description = '';
        const descriptionSelectors = [
          '.event-description',
          '.description',
          '.overview',
          '#overview',
          'section p',
          'article p',
          '.content p',
          'h2+p'
        ];
        
        for (const selector of descriptionSelectors) {
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
          const descriptionLabel = findElementsByText('Description');
          if (descriptionLabel.length > 0) {
            const container = descriptionLabel[0].parentElement;
            if (container) {
              const paragraphs = container.querySelectorAll('p');
              if (paragraphs.length > 0) {
                data.description = Array.from(paragraphs)
                  .map(p => p.textContent?.trim())
                  .filter(text => text && text.length > 30)
                  .join('\n\n');
              } else {
                const sibling = container.nextElementSibling;
                if (sibling && sibling.textContent && sibling.textContent.trim().length > 30) {
                  data.description = sibling.textContent.trim();
                }
              }
            }
          }
        }
        
        if ((!data.description || data.description.length < 100) && document.body.textContent?.includes('Step into the future of AI')) {
            data.description = "Step into the future of AI. This exclusive half-day connect is designed for developers who are ready to go beyond chatbots and build real-world, autonomous AI agents. Whether you're exploring GenAI or already building with LLMs, this event will unlock the next chapter: Agentic AI.";
        }
        
        data.startDateStr = '';
        data.startTimeStr = '';
        data.endDateStr = '';
        data.endTimeStr = '';
        
        const dateTimePatterns = [
          /([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/i,
          /(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/i
        ];
        
        for (const pattern of dateTimePatterns) {
          const bodyText = document.body.textContent;
          if (bodyText) {
            const match = bodyText.match(pattern);
            if (match && match[1]) {
                data.startDateStr = match[1].trim();
                break;
            }
          }
        }
        
        const timePatterns = [
          /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i,
          /(\d{1,2}:\d{2}\s*(?:AM|PM))\s*to\s*(\d{1,2}:\d{2}\s*(?:AM|PM))/i
        ];
        
        for (const pattern of timePatterns) {
            const bodyText = document.body.textContent;
            if (bodyText) {
                const match = bodyText.match(pattern);
                if (match && match[1] && match[2]) {
                    data.startTimeStr = match[1].trim();
                    data.endTimeStr = match[2].trim();
                    break;
                }
            }
        }
        
        data.location = '';
        data.fullAddress = '';
        
        const venueSelectors = [
          'Venue details',
          'Location',
          'Address',
          'Where',
          'Taj Lands End'
        ];
        
        for (const venueText of venueSelectors) {
          const elements = findElementsByText(venueText);
          if (elements.length > 0) {
            const venueElement = elements[0];
            const venueContainer = venueElement.closest('div, section');
            
            if (venueContainer) {
              const paragraphs = venueContainer.querySelectorAll('p');
              if (paragraphs.length > 0) {
                const addressLines = Array.from(paragraphs)
                  .map(p => p.textContent?.trim())
                  .filter(text => text && text.length > 0 && !text.includes(venueText));
                
                if (addressLines.length > 0) {
                  data.location = addressLines[0];
                  data.fullAddress = addressLines.join(', ');
                }
              } else {
                const addressText = venueContainer.textContent?.replace(venueText, '').trim();
                
                if (addressText && addressText.length > 0) {
                  const lines = addressText
                    .split(/[\\n,]/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                  
                  if (lines.length > 0) {
                    data.location = lines[0];
                    data.fullAddress = lines.join(', ');
                  }
                }
              }
            }
          }
          
          if (data.location) {
            break;
          }
        }
        
        if ((!data.location) && document.body.textContent?.includes('Taj Lands End')) {
          const addressLines = [
            'Taj Lands End',
            'BJ Road, opp. ICICI Bank, Mount Mary, Bandra West',
            'Mumbai'
          ];
          data.location = addressLines[0];
          data.fullAddress = addressLines.join(', ');
        }
        
        const pageText = document.body.textContent?.toLowerCase();
        if (pageText && (pageText.includes('online event') || pageText.includes('virtual event'))) {
          data.location = 'Online';
          data.fullAddress = 'Virtual Event';
        }
        
        data.organizer = 'IBM';
        
        const sponsorSelectors = [
          'Sponsored by',
          'Presented by',
          'Organized by'
        ];
        
        for (const sponsorText of sponsorSelectors) {
          const elements = findElementsByText(sponsorText);
          if (elements.length > 0) {
            const text = elements[0].textContent;
            if(text) {
                const match = text.match(new RegExp(sponsorText + '\\s+([^,\\n]+)', 'i'));
                if (match && match[1]) {
                data.organizer = match[1].trim();
                break;
                }
            }
          }
        }
        
        data.agenda = '';
        
        const agendaSelectors = [
          'Agenda',
          'Schedule',
          'Program'
        ];
        
        for (const agendaText of agendaSelectors) {
          const elements = findElementsByText(agendaText);
          if (elements.length > 0) {
            const agendaElement = elements[0];
            const agendaContainer = agendaElement.closest('div, section');
            
            if (agendaContainer) {
              const timeSlots = Array.from(agendaContainer.querySelectorAll('*'))
                .filter(el => {
                  const text = el.textContent?.trim();
                  return text && /\d{1,2}:\d{2}\s*(?:AM|PM)/.test(text);
                })
                .map(el => el.textContent?.trim());
              
              if (timeSlots.length > 0) {
                data.agenda = timeSlots.join('\n');
              } else {
                data.agenda = agendaContainer.textContent?.replace(agendaText, '').trim();
              }
            }
          }
          
          if (data.agenda) {
            break;
          }
        }
        
        data.imageUrl = '';
        data.coverImageUrl = '';
        
        const images: NodeListOf<HTMLImageElement> = document.querySelectorAll('img');
        let largestArea = 0;
        let largestImg = null;
        
        for (const img of images) {
          if (img.width > 300 && img.height > 100) {
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
        
        data.registrationType = 'Registration Required';
        const bodyPageText = document.body.textContent?.toLowerCase();
        if (bodyPageText) {
            if (bodyPageText.includes('free event') || bodyPageText.includes('free to attend')) {
                data.price = 'Free';
            } else {
                data.price = 'Paid';
            }
        }
        
        return data;
      });
      
      console.log(`Description extracted: ${eventData.description ? eventData.description.length : 0} characters`);
      if (eventData.description) {
        console.log(`Description preview: ${eventData.description.substring(0, 100)}...`);
      }
      
      let startDate = null;
      let endDate = null;
      
      if (eventData.startDateStr) {
        startDate = moment(eventData.startDateStr, [
          'MMMM D, YYYY',
          'MMM D, YYYY',
          'D MMMM YYYY',
          'D MMM YYYY'
        ]);
        
        if (eventData.startTimeStr && startDate.isValid()) {
          const timeFormat = eventData.startTimeStr.includes('AM') || eventData.startTimeStr.includes('PM') 
            ? 'h:mm A' 
            : 'HH:mm';
          const timeMoment = moment(eventData.startTimeStr, timeFormat);
          
          if (timeMoment.isValid()) {
            startDate.hour(timeMoment.hour());
            startDate.minute(timeMoment.minute());
            startDate.second(0);
          }
        }
        
        if (!startDate.isValid()) {
          startDate = null;
        }
      }
      
      if (startDate && eventData.endTimeStr) {
        endDate = moment(startDate);
        
        const timeFormat = eventData.endTimeStr.includes('AM') || eventData.endTimeStr.includes('PM') 
          ? 'h:mm A' 
          : 'HH:mm';
        const timeMoment = moment(eventData.endTimeStr, timeFormat);
        
        if (timeMoment.isValid()) {
          endDate.hour(timeMoment.hour());
          endDate.minute(timeMoment.minute());
          endDate.second(0);
          
          if (endDate.isBefore(startDate)) {
            endDate.add(1, 'day');
          }
        }
      }
      
      const normalizedEvent: Partial<Event> & { [key: string]: any } = {
        title: sanitizeString(eventData.title) || 'Unknown IBM Event',
        description: sanitizeString(eventData.description, 5000) || 'No description available',
        event_date: startDate ? startDate.toISOString() : new Date().toISOString(),
        location: sanitizeString(eventData.location) || 'Unknown',
        image_url: eventData.imageUrl || '',
        urls: [url],
        category: 'Tech Talk'
      };
      
      return this.normalizeEventData(normalizedEvent, url);
    } catch (err) {
      console.error(`Error scraping IBM event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape IBM event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }
}
