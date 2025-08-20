// src/lib/scrapers/base.ts
import { createPage, closePage, Browser, Page, launchBrowser, close } from '@/lib/browser';
import { sleep, sanitizeString } from '@/lib/utils';
import type { Event } from '@/lib/types';


export class BaseScraper {
  page: Page | null = null;
  browser: Browser | null = null;
  url: string = '';

  async initialize() {
      this.browser = await launchBrowser();
      this.page = await createPage(this.browser);
  }

  async navigate(url: string, options: object = {}) {
    if (!this.page) {
      await this.initialize();
    }

    const defaultOptions = {
      waitUntil: 'networkidle2',
      timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '60000', 10)
    };

    const navigationOptions = { ...defaultOptions, ...options };

    try {
      await this.page!.goto(url, navigationOptions);
      
      await sleep(2000);
      
      await this.page!.evaluate(() => {
        window.scrollBy(0, 300);
      });
      
      await sleep(1000);
    } catch (err) {
      console.error(`Navigation error: ${(err as Error).message}`);
      throw new Error(`Failed to navigate to ${url}: ${(err as Error).message}`);
    }
  }

  async extractMetadata(): Promise<Record<string, string>> {
    if (!this.page) throw new Error("Page not initialized");
    try {
      return await this.page.evaluate(() => {
        const metadata: Record<string, string> = {};
        
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(tag => {
          const property = tag.getAttribute('property') || tag.getAttribute('name');
          const content = tag.getAttribute('content');
          
          if (property && content) {
            metadata[property] = content;
          }
        });
        
        const title = document.querySelector('title');
        if (title) {
          metadata.title = title.textContent || '';
        }
        
        return metadata;
      });
    } catch (err) {
      console.error(`Metadata extraction error: ${(err as Error).message}`);
      return {};
    }
  }

  async extractStructuredData(): Promise<any[]> {
    if (!this.page) throw new Error("Page not initialized");
    try {
      return await this.page.evaluate(() => {
        const structuredDataElements = document.querySelectorAll('script[type="application/ld+json"]');
        const data: any[] = [];
        
        structuredDataElements.forEach(element => {
          try {
            if(element.textContent) {
                const parsedData = JSON.parse(element.textContent);
                data.push(parsedData);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        });
        
        return data;
      });
    } catch (err) {
      console.error(`Structured data extraction error: ${(err as Error).message}`);
      return [];
    }
  }

  async extractHtml(): Promise<string> {
    if (!this.page) throw new Error("Page not initialized");
    try {
      return await this.page.content();
    } catch (err) {
      console.error(`HTML extraction error: ${(err as Error).message}`);
      return '';
    }
  }
  
  async scrape(url: string): Promise<Partial<Event>> {
    throw new Error('scrape() method must be implemented by subclasses');
  }

  async close() {
    if (this.page) {
      await closePage(this.page);
      this.page = null;
    }
    if (this.browser) {
      await close(this.browser);
      this.browser = null;
    }
  }
  
  normalizeEventData(eventData: any, url: string): Partial<Event> {
    let platform = 'unknown';
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('meetup')) {
        platform = 'Meetup';
      } else if (hostname.includes('eventbrite')) {
        platform = 'Eventbrite';
      } else if (hostname.includes('lu.ma') || hostname.includes('luma')) {
        platform = 'Lu.ma';
      } else {
        const parts = hostname.split('.');
        if (parts.length > 1) {
          platform = parts[parts.length - 2].charAt(0).toUpperCase() + 
                     parts[parts.length - 2].slice(1);
        }
      }
    } catch (err) {
      // Keep default platform if URL parsing fails
    }
    
    const category = eventData.category || 'Tech Talk';
    
    const techTags = this.extractTechTags(eventData.title + ' ' + eventData.description);
    
    return {
      title: eventData.title || "Untitled Event",
      description: eventData.description || "",
      event_date: eventData.event_date || new Date().toISOString(),
      location: eventData.location || "TBD",
      urls: [url],
      category: category,
      image_url: eventData.image_url || null,
    };
  }
  
  extractTechTags(text: string): string[] {
    if (!text) return [];
    
    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'angular', 'vue', 'nodejs', 'node.js',
      'typescript', 'aws', 'azure', 'gcp', 'cloud', 'devops', 'kubernetes', 'docker',
      'blockchain', 'ai', 'machine learning', 'ml', 'data science', 'ux', 'ui', 'design',
      'web3', 'fullstack', 'frontend', 'backend', 'mobile', 'android', 'ios', 'swift',
      'flutter', 'react native', 'php', 'laravel', 'django', 'ruby', 'rails'
    ];
    
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    techKeywords.forEach(keyword => {
      if (lowerText.includes(keyword) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags;
  }
}
