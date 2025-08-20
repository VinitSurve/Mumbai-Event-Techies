// src/lib/scrapers/gdg.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class GDGScraper extends BaseScraper {
  platform: string;

  constructor(page: any) {
    super(page);
    this.platform = 'Google Developer Groups';
  }

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      
      this.url = url;
      
      console.log('Navigating to GDG URL...');
      
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
        
        await sleep(3000);
      } catch (err) {
        console.error(`Navigation issue: ${(err as Error).message}`);
      }
      
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      const eventData = await this.page.evaluate(() => {
        const data: any = {};
        
        const findElementWithText = (text: string, tagNames = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) => {
          for (const tag of tagNames) {
            const elements = document.querySelectorAll(tag);
            for (const el of elements) {
              if (el.textContent && el.textContent.trim() === text) {
                return el;
              }
            }
          }
          return null;
        };

        const findElementContainingText = (text: string, tagNames = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) => {
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
        
        const titleElement = document.querySelector('h1');
        if (titleElement) {
          data.title = titleElement.textContent?.trim();
        }
        
        const descriptionElement = document.querySelector('h1 + div, h1 + p');
        if (descriptionElement) {
          data.description = descriptionElement.textContent?.trim();
        }
        
        const aboutSection = findElementWithText('About this event');
        if (aboutSection) {
          const aboutParent = aboutSection.parentElement;
          if (aboutParent) {
            const aboutContent = aboutParent.nextElementSibling;
            if (aboutContent) {
              data.description = aboutContent.textContent?.trim() || data.description;
            }
          }
        }
        
        data.startDateStr = '';
        data.endDateStr = '';
        
        const whenSection = findElementWithText('When');
        if (whenSection) {
          const whenParent = whenSection.parentElement;
          if (whenParent) {
            const dateSection = whenParent.nextElementSibling;
            if (dateSection) {
              const dateText = dateSection.textContent?.trim();
              
              if (dateText) {
                const dateMatch = dateText.match(/([A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4})/);
                if (dateMatch) {
                  const date = dateMatch[1];
                  
                  const startTimeMatch = dateText.match(/(\d{1,2}:\d{2} [AP]M)/);
                  if (startTimeMatch) {
                    data.startDateStr = `${date} ${startTimeMatch[1]}`;
                    
                    const endTimeMatch = dateText.match(/– (\d{1,2}:\d{2} [AP]M)/);
                    if (endTimeMatch) {
                      data.endDateStr = `${date} ${endTimeMatch[1]}`;
                    }
                  }
                }
              }
            }
          }
        }
        
        if (!data.startDateStr) {
          const dateTimeRegex = /([A-Za-z]+, [A-Za-z]+ \d{1,2}, \d{4})\s+(\d{1,2}:\d{2} [AP]M)\s+–\s+(\d{1,2}:\d{2} [AP]M)/;
          const fullText = document.body.textContent || '';
          const matches = fullText.match(dateTimeRegex);
          
          if (matches) {
            data.startDateStr = `${matches[1]} ${matches[2]}`;
            data.endDateStr = `${matches[1]} ${matches[3]}`;
          }
        }
        
        data.location = '';
        data.fullAddress = '';
        
        const whereSection = findElementWithText('Where');
        if (whereSection) {
          const whereParent = whereSection.parentElement;
          if (whereParent) {
            const locationSection = whereParent.nextElementSibling;
            if (locationSection) {
              data.location = locationSection.textContent?.trim();
              data.fullAddress = locationSection.textContent?.trim();
            }
          }
        }
        
        data.organizer = '';
        
        const organizersSection = findElementContainingText('Organizer');
        if (organizersSection) {
          const organizerSection = organizersSection.closest('section') || organizersSection.parentElement;
          if (organizerSection) {
            const organizerElements = organizerSection.querySelectorAll('div[role="listitem"]');
            if (organizerElements.length > 0) {
              const organizers: string[] = [];
              organizerElements.forEach(el => {
                const name = el.querySelector('h3, h4');
                if (name) {
                  organizers.push(name.textContent!.trim());
                }
              });
              
              if (organizers.length > 0) {
                data.organizer = organizers.join(', ');
              }
            }
          }
        }
        
        if (!data.organizer) {
          const gdgMatch = window.location.href.match(/gdg-([a-z-]+)/);
          if (gdgMatch) {
            data.organizer = `GDG ${gdgMatch[1].replace(/-/g, ' ').toUpperCase()}`;
          } else {
            data.organizer = 'Google Developer Group';
          }
        }
        
        data.registrationType = 'Registration Required';
        
        const buttons = document.querySelectorAll('button, a');
        for (const button of buttons) {
          if (button.textContent && 
              (button.textContent.includes('RSVP') || 
               button.textContent.includes('Get tickets') || 
               button.textContent.includes('Register'))) {
            data.registrationType = 'RSVP Required';
            break;
          }
        }
        
        const rsvpText = (document.body.textContent || '').match(/(\d+)\s+RSVP['']d/);
        if (rsvpText) {
          data.attendeeCount = parseInt(rsvpText[1], 10);
        }
        
        data.price = 'Free';
        
        if ((document.body.textContent || '').match(/\$\d+|\€\d+|\£\d+|\d+\s+USD/)) {
          data.price = 'Paid';
        }
        
        data.tags = [];
        const keyThemesSection = findElementWithText('Key Themes');
        if (keyThemesSection) {
          const keyThemesParent = keyThemesSection.parentElement;
          if (keyThemesParent) {
            const themeList = keyThemesParent.nextElementSibling;
            if (themeList) {
              const themes = themeList.querySelectorAll('span, div');
              themes.forEach(theme => {
                const themeText = theme.textContent?.trim();
                if (themeText && themeText.length > 0) {
                  data.tags.push(themeText.toLowerCase());
                }
              });
            }
          }
        }
        
        const eventImage = document.querySelector('img[alt*="event"], img[src*="events"]') as HTMLImageElement;
        if (eventImage) {
          data.imageUrl = eventImage.src;
        }
        
        data.agenda = '';
        const agendaSection = findElementWithText('Agenda');
        if (agendaSection) {
          const agendaParent = agendaSection.parentElement;
          if (agendaParent) {
            const agendaItems = agendaParent.querySelectorAll('div[role="listitem"]');
            if (agendaItems.length > 0) {
              const agendaParts: string[] = [];
              agendaItems.forEach(item => {
                const time = item.querySelector('span');
                const title = item.querySelector('h3, h4');
                const speaker = item.querySelector('p');
                
                if (time && title) {
                  let agendaItem = `${time.textContent}: ${title.textContent}`;
                  if (speaker) {
                    agendaItem += ` - ${speaker.textContent}`;
                  }
                  agendaParts.push(agendaItem);
                }
              });
              
              if (agendaParts.length > 0) {
                data.agenda = agendaParts.join('\n');
              }
            }
          }
        }
        
        return data;
      });
      
      const schemaOrgData = this.extractSchemaOrgData(structuredData);
      const jsonLdData = this.extractJsonLdData(structuredData);
      
      const mergedData = {
        ...eventData,
        ...schemaOrgData,
        ...jsonLdData,
        title: eventData.title || schemaOrgData.title || jsonLdData.title || 'Unknown',
      };
      
      let parsedStartDate = null;
      if (mergedData.startDateStr) {
        parsedStartDate = moment(mergedData.startDateStr, [
            'dddd, MMMM D, YYYY h:mm A',
            'MMMM D, YYYY h:mm A',
            'dddd, MMMM Do, YYYY h:mm A',
            'MMMM Do, YYYY h:mm A',
            'ddd, MMM D, YYYY h:mm A',
            'MMM D, YYYY h:mm A',
            'YYYY-MM-DD HH:mm',
            'YYYY/MM/DD HH:mm',
            'DD-MM-YYYY HH:mm',
            'DD/MM/YYYY HH:mm',
          ]);
        if (!parsedStartDate.isValid()) parsedStartDate = moment(mergedData.startDateStr);
      }
      
      let parsedEndDate = null;
      if (mergedData.endDateStr) {
        parsedEndDate = moment(mergedData.endDateStr, [
            'dddd, MMMM D, YYYY h:mm A',
            'MMMM D, YYYY h:mm A',
            'dddd, MMMM Do, YYYY h:mm A',
            'MMMM Do, YYYY h:mm A',
            'ddd, MMM D, YYYY h:mm A',
            'MMM D, YYYY h:mm A',
            'YYYY-MM-DD HH:mm',
            'YYYY/MM/DD HH:mm',
            'DD-MM-YYYY HH:mm',
            'DD/MM/YYYY HH:mm',
          ]);
        if (!parsedEndDate.isValid()) parsedEndDate = moment(mergedData.endDateStr);
      }
      
      const event: {[key: string]: any} = {
        title: sanitizeString(mergedData.title) || 'Unknown',
        description: sanitizeString(mergedData.description, 5000) || 'No description available',
        event_date: (parsedStartDate && parsedStartDate.isValid() ? parsedStartDate.toISOString() : new Date().toISOString()),
        location: sanitizeString(mergedData.location) || 'Unknown',
        organizer: sanitizeString(mergedData.organizer) || 'Unknown',
        image_url: mergedData.imageUrl || '',
        urls: [url],
        category: 'Tech Talk'
      };
      
      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping GDG event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape GDG event: ${(err as Error).message}`);
    }
  }

  extractJsonLdData(structuredData: any[]): any {
    const eventData: any = {};
    
    try {
      const eventObject = structuredData.find(item => item['@type'] === 'Event');
      
      if (eventObject) {
        if (eventObject.name) {
          eventData.title = eventObject.name;
        }
        
        if (eventObject.description) {
          eventData.description = eventObject.description;
        }
        
        if (eventObject.startDate) {
          eventData.startDateStr = eventObject.startDate;
        }
        
        if (eventObject.endDate) {
          eventData.endDateStr = eventObject.endDate;
        }
        
        if (eventObject.location) {
          const location = eventObject.location;
          
          if (typeof location === 'string') {
            eventData.location = location;
            eventData.fullAddress = location;
          } else {
            if (location.name) {
              eventData.location = location.name;
            }
            
            if (location.address) {
              eventData.fullAddress = this.formatAddress(location.address);
            }
            
            if (location.geo) {
              const geo = location.geo;
              if (geo.latitude && geo.longitude) {
                eventData.latitude = parseFloat(geo.latitude);
                eventData.longitude = parseFloat(geo.longitude);
              }
            }
          }
        }
        
        if (eventObject.organizer) {
          const organizer = eventObject.organizer;
          
          if (typeof organizer === 'string') {
            eventData.organizer = organizer;
          } else if (organizer.name) {
            eventData.organizer = organizer.name;
          }
        }
        
        if (eventObject.image) {
          if (typeof eventObject.image === 'string') {
            eventData.imageUrl = eventObject.image;
          } else if (Array.isArray(eventObject.image) && eventObject.image.length > 0) {
            eventData.imageUrl = typeof eventObject.image[0] === 'string' 
              ? eventObject.image[0] 
              : eventObject.image[0].url;
          } else if (eventObject.image.url) {
            eventData.imageUrl = eventObject.image.url;
          }
        }
      }
    } catch (err) {
      console.error(`Error extracting JSON-LD data: ${(err as Error).message}`);
    }
    
    return eventData;
  }

  extractSchemaOrgData(structuredData: any[]): any {
    return {};
  }

  formatAddress(address: any): string {
    if (typeof address === 'string') {
      return address;
    }
    
    if (address) {
      const parts: string[] = [];
      if (address.streetAddress) parts.push(address.streetAddress);
      if (address.addressLocality) parts.push(address.addressLocality);
      if (address.addressRegion) parts.push(address.addressRegion);
      if (address.postalCode) parts.push(address.postalCode);
      if (address.addressCountry) {
        if (typeof address.addressCountry === 'string') {
          parts.push(address.addressCountry);
        } else if (address.addressCountry.name) {
          parts.push(address.addressCountry.name);
        }
      }
      
      return parts.join(', ');
    }
    
    return '';
  }
}
