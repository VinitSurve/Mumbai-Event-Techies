{// src/lib/scrapers/luma.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';


export class LumaScraper extends BaseScraper {
  /**
   * Scrape Lu.ma event
   * @param {string} url - Lu.ma event URL
   * @returns {Promise<Object>} - Event data
   */
  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      if (!this.page) throw new Error("Page not initialized");
      await this.navigate(url);
      
      // Wait for essential elements
      try {
        await this.page.waitForSelector('h1', { timeout: 5000 });
      } catch (err) {
        console.log('Could not find event title element, will try alternative selectors');
      }
      
      // Extract metadata and structured data
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      // Extract specific event data
      const eventData = await this.page.evaluate(() => {
        const data: any = {};
        
        // Title
        data.title = '';
        const titleElement = document.querySelector('h1');
        if (titleElement) {
          data.title = titleElement.textContent?.trim();
        }
        
        // Category
        data.category = '';
        const categoryElements = document.querySelectorAll('a[href*="/category/"]');
        if (categoryElements.length > 0) {
          data.category = categoryElements[0].textContent?.trim();
        }
        
        // Registration Type
        data.registrationType = '';
        // Look for registration text more specifically
        const allHeadings = document.querySelectorAll('h2, h3, h4, h5, strong');
        for (const el of allHeadings) {
          if (el.textContent?.includes('Registration') && el.nextElementSibling) {
            const registrationText = el.nextElementSibling.textContent?.trim();
            // Only capture short text, not JSON objects
            if (registrationText && registrationText.length < 100 && !registrationText.includes('{')) {
              data.registrationType = registrationText;
              break;
            }
          }
        }
        
        // If still not found, look for specific text in paragraphs
        if (!data.registrationType) {
          const paragraphs = document.querySelectorAll('p');
          for (const p of paragraphs) {
            if (p.textContent?.includes('approval') && p.textContent.includes('registration')) {
              data.registrationType = 'Approval Required';
              break;
            } else if (p.textContent?.includes('Registration')) {
              data.registrationType = p.textContent.trim().split('.')[0];
              break;
            }
          }
        }
        
        // Featured In
        data.featuredIn = [];
        // Standard CSS doesn't support :contains, so we need to check all divs manually
        const allDivs = document.querySelectorAll('div');
        for (const el of allDivs) {
          if (el.textContent?.includes('Featured in') && el.nextElementSibling) {
            const items = el.nextElementSibling.querySelectorAll('a');
            for (const item of items) {
                if (item.textContent) {
                    data.featuredIn.push(item.textContent.trim());
                }
            }
            break;
          }
        }
        
        // Cover Image
        data.coverImageUrl = '';
        // Try different image selectors that might contain the cover image
        const coverImageSelectors = [
          'img[alt*="Cover Image"]',
          'img[alt*="cover"]',
          '.event-image img',
          'section > div > img',
          'header img'
        ];
        
        for (const selector of coverImageSelectors) {
          const imgEl = document.querySelector(selector);
          if (imgEl && imgEl.getAttribute('src')) {
            data.coverImageUrl = imgEl.getAttribute('src');
            break;
          }
        }
        
        // Description
        data.description = '';
        const descriptionElements = document.querySelectorAll('.e-description p, [data-testid="event-description"] p, [data-testid="about-event"] p');
        if (descriptionElements.length > 0) {
          data.description = Array.from(descriptionElements).map(el => el.textContent?.trim()).join('\n\n');
        } else {
          // Try various selectors for description
          const descriptionSelectors = [
            '[data-testid="event-description"]',
            '[data-testid="about-event"]',
            '.description',
            '.markdown-body',
            '.event-description',
            'section p',
            'article p'
          ];
          
          for (const selector of descriptionSelectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              data.description = Array.from(elements).map(el => el.textContent?.trim()).join('\n\n');
              break;
            }
          }
        }
        
        // Date/Time
        data.startDateStr = '';
        data.endDateStr = '';
        
        // Check for datetime attribute first
        const timeElement = document.querySelector('time[datetime]');
        if (timeElement) {
          data.startDateStr = timeElement.getAttribute('datetime');
        }
        
        // If no datetime attribute, try to parse from text using various selectors
        if (!data.startDateStr) {
          // Look for date and time elements with various selectors
          const dateSelectors = [
            '.e-day', 
            '[data-testid="event-date"]',
            'time',
            '.date',
            '.event-date',
            '.event-time',
            'span[aria-label*="date"]',
            'div[aria-label*="date"]',
            'span[aria-label*="time"]',
            'div[aria-label*="time"]'
          ];
          
          let dateStr = '';
          for (const selector of dateSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              dateStr += ' ' + el.textContent?.trim();
            }
          }
          
          if (dateStr) {
            data.startDateStr = dateStr.trim();
          }
        }
        
        // Location
        data.location = '';
        data.fullAddress = '';
        // Try various location selectors
        const locationSelectors = [
          '.e-venue', 
          '[data-testid="event-location"]',
          'div[data-testid="location"]',
          '.location',
          '.venue',
          'span[aria-label*="location"]',
          'div[aria-label*="location"]',
          'span[aria-label*="venue"]',
          'div[aria-label*="venue"]'
        ];
        
        for (const selector of locationSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            // Direct selector match
            data.location = el.textContent?.trim();
            
            // Try to find the full address nearby
            const container = el.closest('section, div[data-testid]');
            if (container) {
              const addressElements = container.querySelectorAll('div > p, div > div:not(:first-child)');
              if (addressElements.length > 0) {
                const addressText = Array.from(addressElements)
                  .map(line => line.textContent?.trim())
                  .filter(text => text && text !== data.location)
                  .join(', ');
                
                if (addressText) {
                  data.fullAddress = addressText;
                }
              }
            }
            
            // If we didn't find the address but have location, try to look for
            // the Location heading and get address from there
            if (!data.fullAddress && data.location) {
              const allHeadings = document.querySelectorAll('h2, h3, h4');
              for (const heading of allHeadings) {
                if (heading.textContent?.includes('Location') && heading.nextElementSibling) {
                  const addressContainer = heading.nextElementSibling;
                  const addressElements = addressContainer.querySelectorAll('div, p');
                  if (addressElements.length > 0) {
                    // Skip the first element if it's the venue name we already have
                    const startIndex = addressElements[0].textContent?.trim() === data.location ? 1 : 0;
                    const addressArray = [];
                    
                    for (let i = startIndex; i < addressElements.length; i++) {
                      const text = addressElements[i].textContent?.trim();
                      if (text && !text.includes('Location')) {
                        addressArray.push(text);
                      }
                    }
                    
                    if (addressArray.length > 0) {
                      data.fullAddress = addressArray.join(', ');
                    }
                  }
                  break;
                }
              }
            }
            
            // Check if it's online
            if (data.location && data.location.toLowerCase().includes('online')) {
              data.location = 'Online';
              data.fullAddress = 'Virtual Event';
            }
            
            // If we found location info, break out of the loop
            if (data.location) break;
          }
        }
        
        // Organizer
        data.organizer = '';
        // Try various organizer selectors
        const organizerSelectors = [
          '.e-host-name', 
          '[data-testid="event-host"]',
          '.organizer',
          '.host',
          'span[aria-label*="organizer"]',
          'div[aria-label*="organizer"]',
          'span[aria-label*="host"]',
          'div[aria-label*="host"]',
          'a[href*="user"]'
        ];
        
        for (const selector of organizerSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.organizer = el.textContent?.trim();
            break;
          }
        }
        
        // Image
        data.imageUrl = '';
        const imageElement = document.querySelector('.event-image img') || 
                            document.querySelector('[data-testid="event-image"]');
        if (imageElement) {
          data.imageUrl = imageElement.getAttribute('src');
        }
        
        // Price
        data.price = '';
        const priceElement = document.querySelector('.e-price') || 
                            document.querySelector('[data-testid="event-price"]');
        if (priceElement) {
          data.price = priceElement.textContent?.trim();
          if (data.price.toLowerCase().includes('free')) {
            data.price = 'Free';
          }
        }
        
        // Attendees
        data.attendeeCount = null;
        const attendeeElement = document.querySelector('.e-attendee-count') || 
                              document.querySelector('[data-testid="attendee-count"]');
        if (attendeeElement) {
          const attendeeText = attendeeElement.textContent?.trim();
          if (attendeeText) {
            const match = attendeeText.match(/\d+/);
            if (match) {
              data.attendeeCount = parseInt(match[0], 10);
            }
          }
        }
        
        return data;
      });
      
      // Parse dates
      let startDate = null;
      let endDate = null;
      
      if (eventData.startDateStr) {
        // Lu.ma dates may be in various formats, try to parse with moment
        startDate = moment(eventData.startDateStr).toISOString();
      }
      
      if (eventData.endDateStr) {
        endDate = moment(eventData.endDateStr).toISOString();
      }
      
      // Extract data from structured data if available
      if (structuredData && structuredData.length > 0) {
        // Find Event structured data
        const eventSchema = structuredData.find(data => data["@type"] === "Event");
        if (eventSchema) {
          console.log("Found Event schema in structured data");
          
          // Get description if not already set
          if (!eventData.description && eventSchema.description) {
            eventData.description = eventSchema.description;
          }
          
          // Get start date if not already set
          if (!startDate && eventSchema.startDate) {
            startDate = moment(eventSchema.startDate).toISOString();
          }
          
          // Get end date if not already set
          if (!endDate && eventSchema.endDate) {
            endDate = moment(eventSchema.endDate).toISOString();
          }
          
          // Get location if not already set
          if (!eventData.location && eventSchema.location) {
            if (typeof eventSchema.location === 'object' && eventSchema.location.name) {
              eventData.location = eventSchema.location.name;
              
              // Add address details if available
              if (eventSchema.location.address) {
                const address = eventSchema.location.address;
                
                // Store full address separately
                let fullAddress = [];
                
                if (address.streetAddress) {
                  fullAddress.push(address.streetAddress);
                }
                
                if (address.addressLocality) {
                  fullAddress.push(address.addressLocality);
                }
                
                if (address.addressRegion) {
                  fullAddress.push(address.addressRegion);
                }
                
                if (address.postalCode) {
                  fullAddress.push(address.postalCode);
                }
                
                if (address.addressCountry && address.addressCountry.name) {
                  fullAddress.push(address.addressCountry.name);
                }
                
                if (fullAddress.length > 0) {
                  eventData.fullAddress = fullAddress.join(', ');
                }
              }
              
              // Store geo coordinates if available
              if (eventSchema.location.geo) {
                eventData.latitude = eventSchema.location.geo.latitude;
                eventData.longitude = eventSchema.location.geo.longitude;
              }
            } else if (typeof eventSchema.location === 'string') {
              eventData.location = eventSchema.location;
            }
          }
          
          // Get image if not already set
          if (!eventData.imageUrl && eventSchema.image) {
            if (Array.isArray(eventSchema.image) && eventSchema.image.length > 0) {
              eventData.imageUrl = eventSchema.image[0];
            } else if (typeof eventSchema.image === 'string') {
              eventData.imageUrl = eventSchema.image;
            }
          }
          
          // Get price if not already set
          if (!eventData.price && eventSchema.offers) {
            if (Array.isArray(eventSchema.offers) && eventSchema.offers.length > 0) {
              const offer = eventSchema.offers[0];
              if (offer.price === 0 || offer.price === '0') {
                eventData.price = 'Free';
              } else if (offer.price) {
                eventData.price = `${offer.price} ${offer.priceCurrency || ''}`.trim();
              }
            }
          }
          
          // Get organizer if not already set
          if (!eventData.organizer && eventSchema.organizer) {
            if (Array.isArray(eventSchema.organizer) && eventSchema.organizer.length > 0) {
              const organizer = eventSchema.organizer[0];
              if (typeof organizer === 'object' && organizer.name) {
                eventData.organizer = organizer.name;
              } else if (typeof organizer === 'string') {
                eventData.organizer = organizer;
              }
            } else if (typeof eventSchema.organizer === 'object' && eventSchema.organizer.name) {
              eventData.organizer = eventSchema.organizer.name;
            } else if (typeof eventSchema.organizer === 'string') {
              eventData.organizer = eventSchema.organizer;
            }
          }
        }
      }
      
      // Extract from metadata if still missing
      if (!eventData.description && metadata['og:description']) {
        eventData.description = metadata['og:description'];
      }
      
      if (!eventData.imageUrl && metadata['og:image']) {
        eventData.imageUrl = metadata['og:image'];
      }
      
      // Create normalized event data
      const event: Partial<Event> & { [key: string]: any } = {
        title: sanitizeString(eventData.title),
        description: sanitizeString(eventData.description, 5000),
        event_date: startDate,
        location: sanitizeString(eventData.location),
        image_url: eventData.imageUrl,
        category: sanitizeString(eventData.category || 'Technology') as any,
        urls: [url]
      };
      
      // Normalize and return the event data
      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping Lu.ma event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Lu.ma event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }
}
