// src/lib/scrapers/generic.ts
import moment from 'moment';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BaseScraper } from './base';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';

export class GenericScraper extends BaseScraper {
  async scrape(url: string): Promise<Partial<Event>> {
    try {
      await this.initialize();
      if (!this.page) {
        throw new Error('Page not initialized');
      }
      await this.navigate(url);
      
      const metadata = await this.extractMetadata();
      const structuredData = await this.extractStructuredData();
      const html = await this.extractHtml();
      
      const puppeteerData = await this.extractWithPuppeteer();
      const cheerioData = this.extractWithCheerio(html);
      
      const eventData = {
        title: puppeteerData.title || cheerioData.title || metadata['og:title'] || metadata.title || '',
        description: puppeteerData.description || cheerioData.description || metadata['og:description'] || metadata.description || '',
        startDateStr: puppeteerData.startDateStr || cheerioData.startDateStr || '',
        endDateStr: puppeteerData.endDateStr || cheerioData.endDateStr || '',
        location: puppeteerData.location || cheerioData.location || '',
        organizer: puppeteerData.organizer || cheerioData.organizer || '',
        imageUrl: puppeteerData.imageUrl || cheerioData.imageUrl || metadata['og:image'] || '',
        price: puppeteerData.price || cheerioData.price || '',
        attendeeCount: puppeteerData.attendeeCount || cheerioData.attendeeCount || null
      };
      
      let startDate = null;
      let endDate = null;
      
      if (eventData.startDateStr) {
        try {
          startDate = moment(eventData.startDateStr).toISOString();
        } catch (err) {
          console.log('Could not parse start date:', eventData.startDateStr);
        }
      }
      
      if (eventData.endDateStr) {
        try {
          endDate = moment(eventData.endDateStr).toISOString();
        } catch (err) {
          console.log('Could not parse end date:', eventData.endDateStr);
        }
      }
      
      const event: Partial<Event> & { [key: string]: any } = {
        title: sanitizeString(eventData.title),
        description: sanitizeString(eventData.description, 5000),
        event_date: startDate || new Date().toISOString(),
        location: sanitizeString(eventData.location),
        image_url: eventData.imageUrl,
      };
      
      return this.normalizeEventData(event, url);
    } catch (err) {
      console.error(`Error scraping generic event: ${(err as Error).message}`);
      throw new Error(`Failed to scrape event: ${(err as Error).message}`);
    } finally {
      await this.close();
    }
  }

  async extractWithPuppeteer(): Promise<any> {
    if (!this.page) return {};
    return await this.page.evaluate(() => {
      const data: any = {};
      
      const titleSelectors = [
        'h1', '.title', '.event-title', '.event-name', '[itemprop="name"]',
        '[property="og:title"]', '.heading', '.header-title'
      ];
      
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.title = element.textContent?.trim();
          break;
        }
      }
      
      const descSelectors = [
        '.description', '.event-description', '[itemprop="description"]',
        '.about', '.details', '.content', '.event-details'
      ];
      
      for (const selector of descSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.description = (element as HTMLElement).innerText.trim();
          break;
        }
      }
      
      const dateSelectors = [
        'time', '[itemprop="startDate"]', '.date', '.event-date',
        '.datetime', '.event-time', '.schedule'
      ];
      
      for (const selector of dateSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.startDateStr = element.getAttribute('datetime') || element.textContent?.trim();
          break;
        }
      }
      
      const endDateElement = document.querySelector('[itemprop="endDate"]') || document.querySelector('.end-date');
      if (endDateElement) {
        data.endDateStr = endDateElement.getAttribute('datetime') || endDateElement.textContent?.trim();
      }
      
      const locationSelectors = [
        '[itemprop="location"]', '.location', '.venue', '.place',
        '.event-location', '.address'
      ];
      
      for (const selector of locationSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.location = element.textContent?.trim();
          break;
        }
      }
      
      if (data.location && data.location.toLowerCase().includes('online')) {
        data.location = 'Online';
      }
      
      const organizerSelectors = [
        '[itemprop="organizer"]', '.organizer', '.host',
        '.event-organizer', '.publisher', '.author'
      ];
      
      for (const selector of organizerSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.organizer = element.textContent?.trim();
          break;
        }
      }
      
      const imageSelectors = [
        '[itemprop="image"]', '.event-image', '.cover-image',
        '.banner', '.featured-image', '.hero-image'
      ];
      
      for (const selector of imageSelectors) {
        const element = document.querySelector(selector);
        if (element && element.tagName === 'IMG') {
          data.imageUrl = (element as HTMLImageElement).src;
          break;
        } else if (element) {
          const img = element.querySelector('img');
          if (img) {
            data.imageUrl = img.src;
            break;
          }
        }
      }
      
      const priceSelectors = [
        '[itemprop="price"]', '.price', '.ticket-price',
        '.event-price', '.cost', '.fee'
      ];
      
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          data.price = element.textContent?.trim();
          break;
        }
      }
      
      const attendeeSelectors = [
        '.attendees', '.rsvp-count', '.participants',
        '.going', '.registered'
      ];
      
      for (const selector of attendeeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const attendeeText = element.textContent?.trim();
          const match = attendeeText?.match(/\d+/);
          if (match) {
            data.attendeeCount = parseInt(match[0], 10);
            break;
          }
        }
      }
      
      return data;
    });
  }
  
  extractWithCheerio(html: string): any {
    const data: any = {};
    const $ = cheerio.load(html);
    
    data.title = $('h1').first().text().trim() ||
                 $('.title').first().text().trim() ||
                 $('[itemprop="name"]').first().text().trim() ||
                 '';
                 
    data.description = $('.description').text().trim() ||
                      $('[itemprop="description"]').text().trim() ||
                      $('.about, .details, .content').text().trim() ||
                      '';
                      
    const timeElement = $('time');
    if (timeElement.length) {
      data.startDateStr = timeElement.attr('datetime') || timeElement.text().trim();
    } else {
      data.startDateStr = $('[itemprop="startDate"]').attr('content') ||
                         $('.date, .event-date').text().trim() ||
                         '';
    }
    
    data.endDateStr = $('[itemprop="endDate"]').attr('content') || 
                     $('.end-date').text().trim() || 
                     '';
                     
    data.location = $('[itemprop="location"]').text().trim() ||
                   $('.location, .venue, .place').text().trim() ||
                   '';
                   
    data.organizer = $('[itemprop="organizer"]').text().trim() ||
                    $('.organizer, .host, .author').text().trim() ||
                    '';
                    
    data.imageUrl = $('[itemprop="image"]').attr('src') ||
                   $('.event-image img, .cover-image img').attr('src') ||
                   $('meta[property="og:image"]').attr('content') ||
                   '';
                   
    data.price = $('[itemprop="price"]').text().trim() ||
                $('.price, .ticket-price').text().trim() ||
                '';
                
    const attendeeText = $('.attendees, .rsvp-count').text().trim();
    if (attendeeText) {
      const match = attendeeText.match(/\d+/);
      if (match) {
        data.attendeeCount = parseInt(match[0], 10);
      }
    }
    
    return data;
  }
}
