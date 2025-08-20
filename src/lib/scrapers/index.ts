// src/lib/scrapers/index.ts
import type { Event } from '@/lib/types';
import type { Page } from 'puppeteer';

// Define a common interface for all scrapers
export interface Scraper {
    scrape(page: Page, url: string): Promise<Partial<Event>>;
}

// Import individual scraper classes
import { MeetupScraper } from './meetup';
import { EventbriteScraper } from './eventbrite';
import { LumaScraper } from './luma';
import { GenericScraper } from './generic';

// Scraper factory to return the appropriate scraper for a given URL
export const selectScraper = (url: string): Scraper => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        if (hostname.includes('meetup.com') || hostname.includes('meetu.ps')) {
            return new MeetupScraper();
        } else if (hostname.includes('eventbrite.com') || hostname.includes('eventbrite.')) {
            return new EventbriteScraper();
        } else if (hostname.includes('lu.ma') || hostname.includes('luma.com')) {
            return new LumaScraper();
        }
        // Add more scrapers here
        // else if (hostname.includes('bevy.com')) return new BevyScraper();
        // else if (hostname.includes('gdg.community.dev')) return new GDGScraper();
        // ... and so on

        else {
            return new GenericScraper();
        }
    } catch (err) {
        console.error('Error creating scraper:', (err as Error).message);
        return new GenericScraper();
    }
};