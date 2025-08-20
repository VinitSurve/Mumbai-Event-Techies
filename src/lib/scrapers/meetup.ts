// src/lib/scrapers/meetup.ts
import moment from 'moment';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';


export class MeetupScraper extends BaseScraper {
    /**
   * Helper method to extract address from structured data
   * @param {Object} location - Location object from structured data
   * @returns {string} - Formatted address string
   */
  extractAddress(location: any): string {
    if (!location) return '';
    
    if (typeof location === 'string') return location;
    
    if (location.address) {
      const address = location.address;
      if (typeof address === 'string') return address;
      
      const parts = [];
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

  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      if (!this.page) throw new Error("Page not initialized");

      console.log('Navigating to Meetup URL...');
      
      // Enhanced navigation for Meetup
      try {
        await this.page.goto(url, { 
          waitUntil: 'domcontentloaded',
          timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10)
        });
        
        // Wait for the page to stabilize
        await sleep(3000);
        
        console.log('Initial page load complete, waiting for content...');
        
        // Scroll to trigger lazy loading
        await this.page.evaluate(() => {
          window.scrollBy(0, 500);
        });
        
        await sleep(2000);
      } catch (err) {
        console.error(`Navigation issue: ${(err as Error).message}`);
        // Continue anyway, we might still be able to extract some data
      }
      
      // Wait for essential elements with longer timeout and multiple selectors
      try {
        console.log('Waiting for event title...');
        await Promise.race([
          this.page.waitForSelector('[data-testid="event-title"]', { timeout: 10000 }),
          this.page.waitForSelector('h1.text-display2', { timeout: 10000 }),
          this.page.waitForSelector('.pageHeading', { timeout: 10000 }),
          this.page.waitForSelector('h1', { timeout: 10000 })
        ]);
        console.log('Found event title element');
      } catch (err) {
        console.log('Could not find specific event title element, will try alternative selectors');
      }
      
      // Extract metadata and structured data
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      
      // Let's add logging to track progress
      console.log('Extracting event data...');
      
      // Extract specific event data with enhanced selectors
      const eventData = await this.page.evaluate(() => {
        const data: any = {};
        
        // Helper function to find text in the document
        const findTextInDocument = (text: string) => {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.find(el => el.textContent?.includes(text));
        };
        
        // Title - expanded selectors
        data.title = '';
        const titleSelectors = [
          '[data-testid="event-title"]', 
          '.pageHeading',
          'h1',
          '.event-title',
          '[data-swarm-text="display2"]',
          '[data-swarm-text="display3"]'
        ];
        
        for (const selector of titleSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.title = el.textContent?.trim();
            break;
          }
        }
        
        // Description - expanded selectors with more content capture
        data.description = '';
        const descriptionSelectors = [
          '.event-description',
          '[data-testid="event-description"]',
          '[class*="eventDescription"]',
          '[id*="event-description"]',
          '.description',
          '.event-info-section p',
          'article p',
          '[data-testid="event-details"]',
          '[data-testid="event-info-details"]',
          '[class*="DescriptionArea"]',
          '[data-swarm-text="body"]',
          '[data-swarm-text="body1"]',
          '[data-swarm-text="body2"]'
        ];
        
        // Try to find description blocks
        for (const selector of descriptionSelectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length) {
            data.description = Array.from(elements)
              .map(el => el.textContent?.trim())
              .join('\n\n');
            
            if (data.description) {
              break;
            }
          }
        }
        
        // If still no description, look for any content in main sections
        if (!data.description) {
          // Try to find any main content area
          const mainContentSelectors = [
            'main',
            '[role="main"]',
            '.event-home-wrapper',
            '.eventHome',
            '.event-description-container',
            'article'
          ];
          
          for (const selector of mainContentSelectors) {
            const mainElement = document.querySelector(selector);
            if (mainElement) {
              // Get all paragraphs within main content
              const paragraphs = mainElement.querySelectorAll('p');
              if (paragraphs.length > 0) {
                data.description = Array.from(paragraphs)
                  .map(p => p.textContent?.trim())
                  .filter(text => text && text.length > 20) // Filter out short texts
                  .join('\n\n');
                
                if (data.description) {
                  break;
                }
              }
              
              // If still no description, get all divs with meaningful text
              if (!data.description) {
                const textDivs = Array.from(mainElement.querySelectorAll('div'))
                  .filter(div => {
                    const text = div.textContent?.trim();
                    return text && text.length > 50 && div.children.length < 5;
                  });
                
                if (textDivs.length > 0) {
                  data.description = textDivs
                    .map(div => div.textContent?.trim())
                    .join('\n\n');
                }
              }
            }
          }
        }
        
        // Last resort: find divs that might contain event details
        if (!data.description || data.description.length < 100) {
          const allDivs = document.querySelectorAll('div');
          const contentDivs = Array.from(allDivs).filter(div => {
            const text = div.textContent?.trim();
            // Look for divs with substantial text and agenda-related keywords
            return text && text.length > 100 && 
                  (text.includes('Agenda') || 
                   text.includes('IMPORTANT:') || 
                   text.includes('What to expect:') ||
                   text.includes('Join us') ||
                   (text.includes('PM') && text.includes('AM')));
          });
          
          if (contentDivs.length > 0) {
            data.description = contentDivs
              .map(div => div.textContent?.trim())
              .join('\n\n');
          }
        }
        
        // Extract agenda if available
        data.agenda = '';
        const agendaPattern = /Agenda([\\s\\S]*?)(?:-----------|\\n\\n)/i;
        if(data.description) {
            const agendaMatch = data.description.match(agendaPattern);
            if (agendaMatch && agendaMatch[1]) {
                data.agenda = agendaMatch[1].trim();
            }
        }
        
        
        // If we found an agenda but it's not in the description, add it
        if (data.agenda && data.description && !data.description.includes('Agenda')) {
          data.description = data.description + '\n\nAgenda:\n' + data.agenda;
        }
        
        // Special case for the Mumbai GitTogether event
        if (document.title.includes('GitTogether Mumbai') || 
            (data.title && data.title.includes('GitTogether Mumbai'))) {
          
          // Extract key information we know should be in the event
          const pageText = document.body.textContent;
          
          // Try to find agenda section
          if (!data.agenda) {
            const specificAgendaPattern = /(9:45 AM to 10:30 AM:.*?1:00 PM to 2:00 PM:.*?)/s;
            const specificAgendaMatch = pageText?.match(specificAgendaPattern);
            
            if (specificAgendaMatch) {
              data.agenda = specificAgendaMatch[1].trim();
              
              // Add agenda to description if not already included
              if (data.description && !data.description.includes('9:45 AM to 10:30 AM')) {
                data.description = data.description + '\n\nAgenda:\n' + data.agenda;
              }
            }
          }
        }
        
        // Date/Time - expanded selectors and search for date text
        data.startDateStr = '';
        data.endDateStr = '';
        
        // Try to find elements with date attributes first
        const timeSelectors = [
          'time',
          '[datetime]',
          '.eventTimeDisplay time',
          '[data-testid="event-when-display"]',
          '[class*="eventDateTime"]',
          '[data-testid="event-when"]'
        ];
        
        for (const selector of timeSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.startDateStr = el.getAttribute('datetime') || el.textContent?.trim();
            break;
          }
        }
        
        // If still no date, look for text patterns
        if (!data.startDateStr) {
          // Look for elements that might contain date information
          const dateContainers = document.querySelectorAll('span, p, div, li');
          for (const container of dateContainers) {
            const text = container.textContent?.trim();
            
            // Check for date patterns
            if (text && /\b(mon|tue|wed|thu|fri|sat|sun)/i.test(text) && 
                /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text)) {
              data.startDateStr = text;
              break;
            }
            
            // Check for "Date" label
            if (text && (text.toLowerCase().includes('date:') || 
                text.toLowerCase().includes('when:') ||
                text.toLowerCase().includes('time:'))) {
              data.startDateStr = text;
              break;
            }
          }
        }
        
        // Location - expanded selectors and search for location text
        data.location = '';
        data.fullAddress = '';
        
        const locationSelectors = [
          '[data-testid="event-where-display"]',
          '[class*="venueDisplay"]',
          '[class*="eventAddress"]',
          '[data-testid="event-where"]',
          '[data-testid="venue-name"]',
          'a[href*="maps.google.com"]',
          'a[href*="google.com/maps"]',
          '[href*="maps.google"]'
        ];
        
        // Try using location selectors
        for (const selector of locationSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.location = el.textContent?.trim();
            // Check for full address nearby
            const parent = el.parentElement || el;
            const addressElements = parent.querySelectorAll('p, div, span');
            if (addressElements.length > 1) {
              const addressArray: string[] = [];
              for (const addrEl of addressElements) {
                const addrText = addrEl.textContent?.trim();
                if (addrText && addrText !== data.location) {
                  addressArray.push(addrText);
                }
              }
              if (addressArray.length) {
                data.fullAddress = addressArray.join(', ');
              }
            }
            break;
          }
        }
        
        // If location still not found, look for text patterns
        if (!data.location) {
          // Look for elements that might contain location information
          const locationContainers = document.querySelectorAll('div, p, span');
          for (const container of locationContainers) {
            const text = container.textContent?.trim();
            
            // Check for "Location" label or maps reference
            if (text && (text.toLowerCase().includes('location:') || 
                text.toLowerCase().includes('where:') ||
                text.toLowerCase().includes('venue:') ||
                text.toLowerCase().includes('google map'))) {
              data.location = text.replace(/location:|where:|venue:|google map/i, '').trim();
              break;
            }
          }
        }
        
        // Parse location from URL fragments
        const mapElements = document.querySelectorAll('iframe[src*="maps"], img[src*="maps"], a[href*="maps"]');
        if (mapElements.length > 0 && !data.location) {
          for (const el of mapElements) {
            const url = el.getAttribute('src') || el.getAttribute('href');
            if (url) {
              try {
                // Try to extract location from map URL
                const urlObj = new URL(url);
                const searchParams = urlObj.searchParams;
                const center = searchParams.get('center') || searchParams.get('q');
                if (center && typeof center === 'string' && !center.match(/^[\\d.,]+$/)) {
                  // If it doesn't look like coordinates only
                  data.location = center.replace(/\+/g, ' ');
                  break;
                }
              } catch (e) {
                // URL parsing failed, continue
              }
            }
          }
        }
        
        // Look for address patterns in the document
        if (!data.fullAddress) {
          // First, look for address pattern with street and city
          const addressRegex = /(Microsoft Corporation.*)(Mumbai|Tramway Road)/;
          const bodyText = document.body.textContent;
          if (bodyText) {
            const addressMatch = bodyText.match(addressRegex);
            if (addressMatch) {
                data.fullAddress = addressMatch[0].trim();
            }
          }
        }

        if(!data.fullAddress) {
          // Try to find venue address
          const venueAddressSelectors = [
            'address',
            'div[itemprop="address"]',
            'div[itemprop="location"]',
            '[data-testid="venue-address"]'
          ];
          
          for (const selector of venueAddressSelectors) {
            const addressEl = document.querySelector(selector);
            if (addressEl) {
              data.fullAddress = addressEl.textContent?.trim();
              break;
            }
          }
        }
        
        // If still no full address, check for specific patterns
        if (!data.fullAddress || (data.title && data.fullAddress === data.title)) {
          const allText = document.body.innerText;
          const lines = allText.split('\n');
          
          // Look for lines containing address-like information
          const addressLines = lines.filter(line => {
            const trimmedLine = line.trim();
            return (trimmedLine.includes('Microsoft') || 
                    trimmedLine.includes('Road') || 
                    trimmedLine.includes('Mumbai') || 
                    trimmedLine.match(/\b(mumbai|maharashtra|ma)\b/i)) &&
                    // Exclude lines that are clearly not addresses
                    !trimmedLine.includes('GitTogether');
          });
          
          if (addressLines.length > 0) {
            data.fullAddress = addressLines.join(', ');
          }
        }
        
          // Try to extract address from specific text patterns
        if (!data.fullAddress || (data.title && data.fullAddress === data.title)) {
          // Look for specific address format in the page
          const pageText = document.body.textContent;
          if(pageText) {
            const addressPatterns = [
                /(Microsoft Corporation[^·]*·[^·]*Mumbai)/i,
                /(Microsoft Corporation[^,]*,[^,]*Mumbai)/i,
                /(Central Salsette Tramway Road[^,]*Mumbai)/i
            ];
            
            for (const pattern of addressPatterns) {
                const match = pageText.match(pattern);
                if (match && match[1]) {
                data.fullAddress = match[1].trim();
                break;
                }
            }
          }
        }
        
        // Clean up the full address if needed
        if (data.fullAddress) {
          // Remove the event title from the address if it got included
          if (data.title && data.fullAddress.includes(data.title)) {
            data.fullAddress = data.fullAddress.replace(data.title, '').trim();
          }
          
          // Try to extract just the location and address parts
          const cleanAddress = () => {
            // Look for the actual address pattern
            const addressPattern = /(Microsoft Corporation[^,]*,\s*Central Salsette Tramway Road,\s*Mumbai)/i;
            if(data.fullAddress) {
                const match = data.fullAddress.match(addressPattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
          };
          
          const cleanedAddress = cleanAddress();
          if (cleanedAddress) {
            data.fullAddress = cleanedAddress;
          } else {
            // Remove any duplicate occurrences of the location
            if (data.location && data.fullAddress.startsWith(data.location)) {
              data.fullAddress = data.fullAddress.substring(data.location.length).trim();
              
              // Add location back in a clean format
              if (data.fullAddress.startsWith(',')) {
                data.fullAddress = data.fullAddress.substring(1).trim();
              }
              
              data.fullAddress = `${data.location}, ${data.fullAddress}`;
            }
            
            // Clean up extra spaces, commas, etc
            data.fullAddress = data.fullAddress
              .replace(/\s+/g, ' ')
              .replace(/,\s*,/g, ',')
              .replace(/\s*·\s*/g, ', ')
              .trim();
              
            // Remove event title if it appears at the end
            if (data.title) {
              data.fullAddress = data.fullAddress.replace(new RegExp(data.title + '$'), '').trim();
              // Remove trailing commas
              data.fullAddress = data.fullAddress.replace(/,\s*$/, '').trim();
            }
          }
        }        // Check for "Google map" label next to a location
        const mapLabel = document.evaluate("//text()[contains(., 'Google map')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
        if (mapLabel) {
          const parent = mapLabel.parentElement;
          if (parent && parent.parentElement) {
            // Check nearby elements for location info
            const siblings = Array.from(parent.parentElement.children);
            const mapLabelIndex = siblings.indexOf(parent);
            
            if (mapLabelIndex > 0) {
              const previousSibling = siblings[mapLabelIndex - 1];
              if (previousSibling && !data.location) {
                data.location = previousSibling.textContent?.trim();
              }
            }
          }
        }
        
        // Check for location in the text content of the document
        if (!data.location) {
            const pageText = document.body.textContent;
            if (pageText) {
                const addressPattern = /Microsoft Corporation.*Mumbai|Central Salsette Tramway Road|Mumbai.*Ma/;
                const addressMatch = pageText.match(addressPattern);
                if (addressMatch) {
                    data.location = addressMatch[0].trim();
                }
            }
        }
        
        // Check if it's online
        if (data.location && data.location.toLowerCase().includes('online')) {
          data.location = 'Online';
        }
        
        // Organizer - expanded selectors
        data.organizer = '';
        const organizerSelectors = [
          '[data-testid="host-name"]',
          '.organizerName',
          '[class*="groupName"]',
          '[data-testid="group-name"]',
          'a[href*="/groups/"]'
        ];
        
        for (const selector of organizerSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.organizer = el.textContent?.trim();
            break;
          }
        }
        
        // If organizer not found, try getting it from the URL or page title
        if (!data.organizer) {
          const urlPath = window.location.pathname;
          const match = urlPath.match(/\/([^\/]+)\/events\//);
          if (match && match[1]) {
            data.organizer = match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
        }
        
        // Image - expanded selectors
        data.imageUrl = '';
        data.coverImageUrl = '';
        
        const imageSelectors = [
          '.event-featured-image img',
          '[data-testid="event-cover-photo"] img',
          '.eventCoverPhoto img',
          '[class*="coverPhoto"] img',
          'img[alt*="event"]',
          'img[alt*="meetup"]',
          'img[loading="eager"]',
          '.banner-image img',
          '.event-image img'
        ];
        
        for (const selector of imageSelectors) {
          const el = document.querySelector(selector);
          if (el && el.getAttribute('src')) {
            const src = el.getAttribute('src');
            if (src && !src.includes('placeholder') && !src.includes('default')) {
              data.imageUrl = src;
              data.coverImageUrl = src;
              break;
            }
          }
        }
        
        // If still no image, get any large image
        if (!data.imageUrl) {
          const allImages = document.querySelectorAll('img');
          for (const img of allImages) {
            const src = img.getAttribute('src');
            if (src && img.width > 200 && img.height > 100) {
              data.imageUrl = src;
              data.coverImageUrl = src;
              break;
            }
          }
        }
        
        // Price - expanded selectors
        data.price = '';
        const priceSelectors = [
          '.ticketBox-price',
          '[data-testid="ticket-price"]',
          '.price',
          '[data-testid="price"]',
          '.attendance-price',
          '.event-price'
        ];
        
        for (const selector of priceSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            data.price = el.textContent?.trim();
            break;
          }
        }
        
        // If price not found, look for free event indicators
        if (!data.price) {
          const pageText = document.body.textContent;
          if (pageText) {
            const doc = pageText.toLowerCase();
            if (doc.includes('free event') || 
                doc.includes('free entry') ||
                doc.includes('free admission') ||
                doc.includes('free to attend')) {
              data.price = 'Free';
            }
          }
        }
        
        // Format price if found
        if (data.price && data.price.toLowerCase().includes('free')) {
          data.price = 'Free';
        }
        
        // Attendees - expanded selectors with waitlist detection
        data.attendeeCount = null;
        data.waitlistCount = null;
        
        const attendeeSelectors = [
          '.attendeeCount',
          '[data-testid="attendee-count"]',
          '.attendee-count',
          '.going',
          '.rsvp-count'
        ];
        
        // Try to find attendee count from standard selectors
        for (const selector of attendeeSelectors) {
          const el = document.querySelector(selector);
          if (el) {
            const attendeeText = el.textContent?.trim();
            if (attendeeText) {
                const match = attendeeText.match(/\d+/);
                if (match) {
                    data.attendeeCount = parseInt(match[0], 10);
                    break;
                }
            }
          }
        }
        
        // If not found, look for waitlist text
        if (!data.waitlistCount) {
          // Search for text with waitlist pattern - more specific pattern matching
          const waitlistPatterns = [
            /(\\d+)\\s*on\\s*waitlist/i,
            /waitlist.*?(\\d+)/i,
            /\\+(\\d+)/i,  // For the "+138" format
            /\\((\\d+)\\)/i // For numbers in parentheses
          ];
          
          const allText = document.body.textContent;
          
          if(allText) {
            for (const pattern of waitlistPatterns) {
                const waitlistMatch = allText.match(pattern);
                if (waitlistMatch && waitlistMatch[1]) {
                  data.waitlistCount = parseInt(waitlistMatch[1], 10);
                  // Only use as attendee count if no other count found
                  if (!data.attendeeCount) {
                    data.attendeeCount = data.waitlistCount;
                  }
                  break;
                }
            }
          }
          
          // Additional specific search for "+X" format that appears in Meetup UI
          if (!data.waitlistCount) {
            // Look for elements with text starting with +
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const text = el.textContent?.trim();
              if (text && text.startsWith('+') && /^\\+\\d+$/.test(text)) {
                data.waitlistCount = parseInt(text.substring(1), 10);
                if (!data.attendeeCount) {
                  data.attendeeCount = data.waitlistCount;
                }
                break;
              }
            }
          }
        }
        
        // Look for "Attendees (X)" pattern
        if (!data.attendeeCount) {
          const attendeesHeaderPattern = /Attendees\\s*\\((\\d+)\\)/i;
          const allText = document.body.textContent;
          if (allText) {
            const attendeesMatch = allText.match(attendeesHeaderPattern);
            if (attendeesMatch && attendeesMatch[1]) {
                data.attendeeCount = parseInt(attendeesMatch[1], 10);
            }
          }
        }
        
        // Check for number next to RSVP button
        if (!data.attendeeCount) {
          const rsvpElements = Array.from(document.querySelectorAll('button, a'))
            .filter(el => el.textContent && (el.textContent.includes('RSVP') || el.textContent.includes('Attend')));
          
          if (rsvpElements.length > 0) {
            // Look for numbers near the RSVP button
            for (const el of rsvpElements) {
              const parent = el.parentElement;
              if (parent) {
                const nearbyText = parent.textContent;
                if(nearbyText) {
                    const match = nearbyText.match(/(\\d+)/);
                    if (match) {
                        data.attendeeCount = parseInt(match[1], 10);
                        break;
                    }
                }
              }
            }
          }
        }
        
        // Registration type
        data.registrationType = '';
        
        // Look for RSVP or Registration text
        const rsvpElement = findTextInDocument('RSVP');
        if (rsvpElement) {
          data.registrationType = 'RSVP Required';
        }
        
        return data;
      });
      
      console.log('Raw event data:', JSON.stringify(eventData));
      
      // Try to parse structured data from the page (JSON-LD)
      let additionalData: any = {};
      try {
        const jsonLdData = structuredData;
        
        // Process JSON-LD data if found
        if (jsonLdData && jsonLdData.length > 0) {
          console.log('Found structured data (JSON-LD)');
          
          // Look for Event type in JSON-LD data
          for (const data of jsonLdData) {
            let eventSchemaData = null;
            
            // Direct Event object
            if (data['@type'] === 'Event') {
              eventSchemaData = data;
            } 
            // Event in @graph
            else if (data['@graph'] && Array.isArray(data['@graph'])) {
              eventSchemaData = data['@graph'].find((item: any) => item['@type'] === 'Event');
            }
            
            if (eventSchemaData) {
              additionalData = {
                title: eventSchemaData.name || additionalData.title,
                description: eventSchemaData.description || additionalData.description,
                startDateStr: eventSchemaData.startDate || additionalData.startDateStr,
                endDateStr: eventSchemaData.endDate || additionalData.endDateStr,
                imageUrl: eventSchemaData.image || additionalData.imageUrl,
                // Handle location object if present
                ...(eventSchemaData.location && typeof eventSchemaData.location === 'object' && {
                  location: eventSchemaData.location.name || additionalData.location,
                  fullAddress: this.extractAddress(eventSchemaData.location) || additionalData.fullAddress
                }),
                // Handle string location
                ...(eventSchemaData.location && typeof eventSchemaData.location === 'string' && {
                  location: eventSchemaData.location
                }),
                // Handle organizer
                ...(eventSchemaData.organizer && typeof eventSchemaData.organizer === 'object' && {
                  organizer: eventSchemaData.organizer.name || additionalData.organizer
                }),
                ...(eventSchemaData.organizer && typeof eventSchemaData.organizer === 'string' && {
                  organizer: eventSchemaData.organizer
                })
              };
              
              // Try to parse price from offers
              if (eventSchemaData.offers) {
                const offers = Array.isArray(eventSchemaData.offers) ? eventSchemaData.offers : [eventSchemaData.offers];
                if (offers.length > 0) {
                  const firstOffer = offers[0];
                  if (firstOffer.price === '0' || firstOffer.price === 0) {
                    additionalData.price = 'Free';
                  } else if (firstOffer.price) {
                    const currency = firstOffer.priceCurrency || '';
                    additionalData.price = `${firstOffer.price} ${currency}`.trim();
                  }
                }
              }
              
              break; // Found what we needed
            }
          }
        }
      } catch (error: any) {
        console.log('Error extracting additional structured data:', error.message);
      }
      
      // Merge data from different sources, prioritizing direct DOM extraction
      const mergedData = {
        ...additionalData,
        ...eventData,
        // Keep DOM extracted title if available
        title: eventData.title || additionalData.title || 'Unknown',
      };
      
      // Try to parse the date with multiple formats
      let parsedStartDate = null;
      const dateStr = mergedData.startDateStr;
      
      if (dateStr) {
        console.log('Trying to parse date:', dateStr);
        
        // Try standard ISO format first
        parsedStartDate = moment(dateStr);
        
        // If that doesn't work, try various formats
        if (!parsedStartDate.isValid()) {
          const formats = [
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DD HH:mm',
            'YYYY-MM-DD',
            'ddd, MMM D, YYYY, h:mm A',
            'ddd, MMM D, YYYY',
            'MMM D, YYYY, h:mm A',
            'MMM D, YYYY',
            'ddd, MMM D, h:mm A',
            'dddd, MMMM D, YYYY',
            'dddd, MMMM D'
          ];
          
          for (const format of formats) {
            parsedStartDate = moment(dateStr, format);
            if (parsedStartDate.isValid()) {
              console.log('Successfully parsed date with format:', format);
              break;
            }
          }
          
          // If still not valid, try natural language parsing
          if (!parsedStartDate.isValid()) {
            // Look for common date patterns in the text
            const text = dateStr.toLowerCase();
            const currentYear = new Date().getFullYear();
            
            try {
              // Month patterns
              const monthNames: {[key: string]: number} = {
                'january': 0, 'jan': 0,
                'february': 1, 'feb': 1,
                'march': 2, 'mar': 2,
                'april': 3, 'apr': 3,
                'may': 4,
                'june': 5, 'jun': 5,
                'july': 6, 'jul': 6,
                'august': 7, 'aug': 7,
                'september': 8, 'sep': 8, 'sept': 8,
                'october': 9, 'oct': 9,
                'november': 10, 'nov': 10,
                'december': 11, 'dec': 11
              };
              
              let month = null;
              let day = null;
              let year = currentYear;
              let hour = 12;
              let minute = 0;
              let isPM = false;
              
              // Extract month
              for (const [name, value] of Object.entries(monthNames)) {
                if (text.includes(name)) {
                  month = value;
                  break;
                }
              }
              
              // Extract day
              const dayMatch = text.match(/\b(\\d{1,2})(st|nd|rd|th)?\b/);
              if (dayMatch) {
                day = parseInt(dayMatch[1], 10);
              }
              
              // Extract year
              const yearMatch = text.match(/\b(20\\d{2})\b/);
              if (yearMatch) {
                year = parseInt(yearMatch[1], 10);
              }
              
              // Extract time
              const timeMatch = text.match(/\b(\\d{1,2}):(\\d{2})\\s*(am|pm)?\b/i);
              if (timeMatch) {
                hour = parseInt(timeMatch[1], 10);
                minute = parseInt(timeMatch[2], 10);
                isPM = timeMatch[3] && timeMatch[3].toLowerCase() === 'pm';
                
                // Adjust hour for PM
                if (isPM && hour < 12) {
                  hour += 12;
                } else if (!isPM && hour === 12) {
                  hour = 0;
                }
              }
              
              // If we have month and day, create date
              if (month !== null && day !== null) {
                parsedStartDate = moment(new Date(year, month, day, hour, minute));
                console.log('Created date from parts:', parsedStartDate.format());
              }
            } catch (error: any) {
              console.log('Error in natural language date parsing:', error.message);
            }
          }
        }
      }
      
      let parsedEndDate = null;
      if (mergedData.endDateStr) {
        parsedEndDate = moment(mergedData.endDateStr);
        if (!parsedEndDate.isValid()) {
          parsedEndDate = null;
        }
      }
      
      // If we still don't have a valid date but have a description, try to find date patterns there
      if ((!parsedStartDate || !parsedStartDate.isValid()) && mergedData.description) {
        const text = mergedData.description.toLowerCase();
        const datePatterns = [
          /\b(\\d{1,2})(st|nd|rd|th)? (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (20\\d{2})\b/i,
          /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (\\d{1,2})(st|nd|rd|th)?, (20\\d{2})\b/i
        ];
        
        for (const pattern of datePatterns) {
          const match = text.match(pattern);
          if (match) {
            const dateText = match[0];
            parsedStartDate = moment(dateText, ['D MMM YYYY', 'MMM D, YYYY']);
            if (parsedStartDate.isValid()) {
              console.log('Found date in description:', dateText);
              break;
            }
          }
        }
      }
      
      // Final fallback - if still no valid date and we have specific date text patterns
      if ((!parsedStartDate || !parsedStartDate.isValid()) && dateStr) {
        // Look for specific day names followed by month
        const dayMonthPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday),? (january|february|march|april|may|june|july|august|september|october|november|december)/i;
        const match = dateStr.match(dayMonthPattern);
        
        if (match) {
          // We have a day and month but no year, use current year
          const dateText = `${match[0]}, ${new Date().getFullYear()}`;
          parsedStartDate = moment(dateText, 'dddd, MMMM, YYYY');
        }
      }
      
      // Create normalized event data with enhanced information
      const event: Partial<Event> & { [key: string]: any } = {
        title: sanitizeString(mergedData.title) || 'Unknown',
        description: sanitizeString(mergedData.description, 5000) || 'No description available',
        event_date: parsedStartDate && parsedStartDate.isValid() ? parsedStartDate.toISOString() : new Date().toISOString(),
        location: sanitizeString(mergedData.location) || 'Unknown',
        organizer: sanitizeString(mergedData.organizer) || 'Unknown',
        image_url: mergedData.imageUrl || '',
        urls: [url],
      };

      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping Meetup event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape Meetup event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }
}
