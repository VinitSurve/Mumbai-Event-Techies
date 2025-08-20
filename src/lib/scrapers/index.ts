// src/lib/scrapers/index.ts
import type { Event } from '@/lib/types';
import type { Page } from 'puppeteer';
import type { BaseScraper } from './base';

// Import individual scraper classes
import { MeetupScraper } from './meetup';
import { EventbriteScraper } from './eventbrite';
import { LumaScraper } from './luma';
import { GenericScraper } from './generic';
import { BevyScraper } from './bevy';
import { DevfolioScraper } from './devfolio';
// Import other scrapers as they are created
// import { Hack2SkillScraper } from './hack2skill';
// import { GDGScraper } from './gdg';
// import { UnstopScraper } from './unstop';
// import { DevpostScraper } from './devpost';
// import { IBMScraper } from './ibm';


// Define a common interface for all scrapers
export interface Scraper {
    scrape(page: Page, url: string): Promise<Partial<Event>>;
}

// Scraper factory to return the appropriate scraper for a given URL
export const selectScraper = (url: string): BaseScraper => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        if (hostname.includes('meetup.com') || hostname.includes('meetu.ps')) {
            return new MeetupScraper();
        } else if (hostname.includes('eventbrite.com') || hostname.includes('eventbrite.')) {
            return new EventbriteScraper();
        } else if (hostname.includes('lu.ma') || hostname.includes('luma.com')) {
            return new LumaScraper();
        } else if (hostname.includes('bevy.com')) {
            return new BevyScraper();
        } else if (hostname.includes('devfolio.co')) {
            return new DevfolioScraper();
        }
        // Add more scrapers here
        // else if (hostname.includes('gdg.community.dev')) {
        //   return new GDGScraper();
        // } else if (hostname.includes('hack2skill.com')) {
        //   return new Hack2SkillScraper();
        // } else if (hostname.includes('unstop.com')) {
        //   return new UnstopScraper();
        // } else if (hostname.includes('devpost.com')) {
        //   return new DevpostScraper();
        // } else if (hostname.includes('ibm.com')) {
        //   return new IBMScraper();
        // }
        else {
            return new GenericScraper();
        }
    } catch (err) {
        console.error('Error creating scraper:', (err as Error).message);
        return new GenericScraper();
    }
};