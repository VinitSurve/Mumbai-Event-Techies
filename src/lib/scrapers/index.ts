// src/lib/scrapers/index.ts
import type { Event } from '@/lib/types';
import type { BaseScraper } from './base';
import type { Page } from 'puppeteer';

// Import individual scraper classes
import { MeetupScraper } from './meetup';
import { EventbriteScraper } from './eventbrite';
import { LumaScraper } from './luma';
import { GenericScraper } from './generic';
import { BevyScraper } from './bevy';
import { DevfolioScraper } from './devfolio';
import { DevpostScraper } from './devpost';
import { GDGScraper } from './gdg';
import { Hack2SkillScraper } from './hack2skill';
import { UnstopScraper } from './unstop';
import { IBMScraper } from './ibm';


// Scraper factory to return the appropriate scraper for a given URL
export const selectScraper = (url: string, page: Page): BaseScraper => {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        if (hostname.includes('meetup.com') || hostname.includes('meetu.ps')) {
            return new MeetupScraper(page);
        } else if (hostname.includes('eventbrite.com') || hostname.includes('eventbrite.')) {
            return new EventbriteScraper(page);
        } else if (hostname.includes('lu.ma') || hostname.includes('luma.com')) {
            return new LumaScraper(page);
        } else if (hostname.includes('bevy.com')) {
            return new BevyScraper(page);
        } else if (hostname.includes('devfolio.co')) {
            return new DevfolioScraper(page);
        } else if (hostname.includes('devpost.com')) {
            return new DevpostScraper(page);
        } else if (hostname.includes('gdg.community.dev')) {
           return new GDGScraper(page);
        } else if (hostname.includes('hack2skill.com')) {
          return new Hack2SkillScraper(page);
        } else if (hostname.includes('unstop.com')) {
          return new UnstopScraper(page);
        } else if (hostname.includes('ibm.com')) {
          return new IBMScraper(page);
        }
        else {
            return new GenericScraper(page);
        }
    } catch (err) {
        console.error('Error creating scraper:', (err as Error).message);
        return new GenericScraper(page);
    }
};
