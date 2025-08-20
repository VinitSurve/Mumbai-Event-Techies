// src/lib/scrapers/index.ts

// This file will act as a factory to select the correct scraper.

import type { Event } from '@/lib/types';
import { scrapeMeetup } from './meetup';
import { scrapeEventbrite } from './eventbrite';
import { scrapeLuma } from './luma';
import { scrapeGeneric } from './generic';

export const selectScraper = (url: string): ((url: string) => Promise<Partial<Event>>) => {
    const domain = new URL(url).hostname;

    if (domain.includes('meetup.com')) {
        return scrapeMeetup;
    }
    if (domain.includes('eventbrite.')) {
        return scrapeEventbrite;
    }
    if (domain.includes('lu.ma') || domain.includes('luma.so')) {
        return scrapeLuma;
    }
    
    // Add other scrapers for specific domains like GDG, Facebook, etc.

    return scrapeGeneric; // Fallback for any other URL
};
