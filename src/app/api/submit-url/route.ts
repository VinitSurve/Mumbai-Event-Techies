// src/app/api/submit-url/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const submitUrlSchema = z.object({
  url: z.string().url({ message: 'Invalid URL provided.' }),
});

// This is a placeholder for the real implementation which will involve
// invoking a scraper and saving to Firestore.
async function handleEventScraping(url: string) {
    console.log(`Scraping for ${url} initiated.`);
    // In a real implementation:
    // 1. Select scraper based on domain
    // 2. Invoke scraper
    // 3. Save to `pendingEvents` in Firestore with status 'pending'
    // 4. Trigger admin notification email (e.g., via a Firebase Function)
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
    handleEventScraping(url).catch(console.error);

    return NextResponse.json({
      requestId,
      message: 'Scraping in progress…',
    }, { status: 202 });

  } catch (error) {
    console.error('Error in /api/submit-url:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
