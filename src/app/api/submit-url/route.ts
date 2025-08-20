// src/app/api/submit-url/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { selectScraper } from '@/lib/scrapers';
import { createPage, closePage, close as closeBrowser } from '@/lib/browser';

const submitUrlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL provided.' }),
});

// This function will now handle the full scraping and data storage process
async function handleEventScraping(url: string, requestId: string) {
    console.log(`[${requestId}] Scraping for ${url} initiated.`);
    
    let page;
    try {
        const scraper = selectScraper(url);
        
        console.log(`[${requestId}] Using scraper for domain: ${new URL(url).hostname}`);
        
        page = await createPage();
        const scrapedData = await scraper.scrape(page, url);

        console.log(`[${requestId}] Scraping successful.`, scrapedData);

        // In a real implementation:
        // 1. Connect to Firebase Admin SDK
        // 2. Save scrapedData to `pendingEvents/{requestId}` in Firestore
        //    const db = getFirestore();
        //    await db.collection('pendingEvents').doc(requestId).set({
        //        ...scrapedData,
        //        originalUrl: url,
        //        status: 'pending',
        //        submittedAt: new Date().toISOString(),
        //    });
        // 3. Trigger admin notification email (e.g., via a Firebase Function)
        console.log(`[${requestId}] Data ready for Firestore. Triggering notifications...`);
        
    } catch (error) {
        console.error(`[${requestId}] Error during scraping process for ${url}:`, error);
        // Here you could update the Firestore doc with an error status
    } finally {
        if (page) {
            await closePage(page);
        }
        // Consider when to close the browser. Maybe after a period of inactivity.
        // For a serverless function, you'd close it after each invocation.
        // await closeBrowser(); 
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
    // We use a self-invoking function to avoid holding up the response
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