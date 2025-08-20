// src/app/api/submit-url/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { selectScraper } from '@/lib/scrapers';
import { close as closeBrowser } from '@/lib/browser';
import { firestore } from '@/lib/firebase-admin';

const submitUrlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL provided.' }),
});

async function handleEventScraping(url: string, requestId: string) {
    console.log(`[${requestId}] Scraping for ${url} initiated.`);
    
    try {
        const scraper = selectScraper(url);
        
        console.log(`[${requestId}] Using scraper for domain: ${new URL(url).hostname}`);
        
        const scrapedData = await scraper.scrape(url);

        console.log(`[${requestId}] Scraping successful.`, scrapedData);

        // Save scrapedData to `pendingEvents/{requestId}` in Firestore
        const db = firestore;
        await db.collection('pendingEvents').doc(requestId).set({
            ...scrapedData,
            originalUrl: url,
            status: 'pending',
            submittedAt: new Date().toISOString(),
        });

        // TODO: Trigger admin notification email (e.g., via a Firebase Function)
        console.log(`[${requestId}] Data saved to Firestore. Triggering notifications...`);
        
    } catch (error) {
        console.error(`[${requestId}] Error during scraping process for ${url}:`, error);
        // Here you could update the Firestore doc with an error status
        try {
            await firestore.collection('pendingEvents').doc(requestId).set({
                originalUrl: url,
                status: 'error',
                error: (error as Error).message,
                submittedAt: new Date().toISOString(),
            });
        } catch (dbError) {
            console.error(`[${requestId}] Failed to write error status to Firestore:`, dbError);
        }
    } finally {
        await closeBrowser(); 
    }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submitUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { url } = parsed.data;
    const requestId = uuidv4();

    // Start the background scraping process but don't wait for it
    (async () => {
      await handleEventScraping(url, requestId);
    })();

    // Respond to the client immediately
    return NextResponse.json({
      requestId,
      message: 'Scraping in progress…',
    }, { status: 202 });

  } catch (error) {
    console.error('Error in /api/submit-url:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
