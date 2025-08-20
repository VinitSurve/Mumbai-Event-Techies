// src/app/api/submit-event/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { selectScraper } from '@/lib/scrapers';
import { firestore } from '@/lib/firebase-admin';
import type { Event } from '@/lib/types';

const submitUrlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL provided.' }),
});

const generateSlug = (title: string, eventDate?: string): string => {
    const cleanTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // replace spaces with hyphens
        .substring(0, 60);

    const dateStr = eventDate
        ? new Date(eventDate).toISOString().slice(0, 7) // "2025-10"
        : new Date().toISOString().slice(0, 7);

    return `${cleanTitle}-${dateStr}`;
}

const generateWhatsAppMessage = (event: Event): string => {
    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });

    return `🚀 मुंबई Event Techies presents

${event.title}

📅 ${eventDate}
📍 ${event.location}

Curated by मुंबई Event Techies community for Mumbai's tech enthusiasts!

👆 Tap to view full details, register & connect with fellow developers

https://mumbai-event-techies.vercel.app/events/${event.slug}

#MumbaiTech #EventTechies #TechCommunity`;
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { url } = parsed.data;
    const eventId = uuidv4();
    
    console.log(`[${eventId}] Scraping for ${url} initiated.`);
    
    const scraper = selectScraper(url);
    console.log(`[${eventId}] Using scraper for domain: ${new URL(url).hostname}`);
    
    const scrapedData = await scraper.scrape(url);
    console.log(`[${eventId}] Scraping successful.`);

    const eventSlug = generateSlug(scrapedData.title || 'event', scrapedData.event_date);

    const finalEvent: Event = {
        id: eventId,
        slug: eventSlug,
        title: scrapedData.title || "Untitled Event",
        description: scrapedData.description || "",
        event_date: scrapedData.event_date || new Date().toISOString(),
        location: scrapedData.location || "TBD",
        category: scrapedData.category || "Tech Talk",
        urls: scrapedData.urls || [url],
        image_url: scrapedData.image_url || null,
        organizer: scrapedData.organizer,
        price: scrapedData.price,
        tags: scrapedData.tags,
        platform: scrapedData.platform,
        registrationUrl: scrapedData.registrationUrl || url,
        isApproved: true,
        createdAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        originalUrl: url,
        viewCount: 0,
        clickCount: 0,
        status: 'upcoming',
    };
    
    const db = firestore;
    await db.collection('events').doc(eventId).set(finalEvent);
    console.log(`[${eventId}] Event data saved to Firestore.`);
    
    const whatsappMessage = generateWhatsAppMessage(finalEvent);

    // Respond to the client immediately
    return NextResponse.json({
      success: true,
      eventId: eventId,
      eventUrl: `https://mumbai-event-techies.vercel.app/events/${eventSlug}`,
      whatsappMessage: whatsappMessage,
      message: 'Event published successfully!',
    }, { status: 200 });

  } catch (error) {
    console.error('Error in /api/submit-event:', error);
    return NextResponse.json({ error: 'An unexpected error occurred during scraping.' }, { status: 500 });
  }
}
