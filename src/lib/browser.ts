// src/lib/browser.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import UserAgent from 'user-agents';
import { config } from 'dotenv';

config();

let browser: Browser | null = null;

export const launchBrowser = async (): Promise<Browser> => {
  if (!browser || !browser.isConnected()) {
    const headless = process.env.HEADLESS !== 'false';
    
    browser = await puppeteer.launch({
      headless: headless ? 'new' : false,
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--blink-settings=imagesEnabled=true',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080
      },
      ignoreHTTPSErrors: true
    });
  }
  return browser;
};

export const createPage = async (browserInstance: Browser): Promise<Page> => {
  const page = await browserInstance.newPage();
  
  const navigationTimeout = parseInt(process.env.NAVIGATION_TIMEOUT || '30000', 10);
  page.setDefaultNavigationTimeout(navigationTimeout);
  
  if (process.env.ROTATE_USER_AGENTS === 'true') {
    const userAgent = new UserAgent({ deviceCategory: 'desktop', platform: 'Win32' });
    await page.setUserAgent(userAgent.toString());
  } else {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');
  }
  
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Cache-Control': 'max-age=0',
  });
  
  await page.setJavaScriptEnabled(true);
  
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    hasTouch: false,
    isLandscape: true,
    isMobile: false,
  });

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    const url = req.url().toLowerCase();
    
    const blockedResources = ['image', 'font', 'media', 'stylesheet'];
    const allowedSubstrings = ['main', 'core', 'bundle'];
    const blockedSubstrings = ['analytics', 'tracking', 'advertisement', 'ad.', '/ads/'];

    if (blockedSubstrings.some(sub => url.includes(sub)) || (blockedResources.includes(resourceType) && !allowedSubstrings.some(sub => url.includes(sub)))) {
      req.abort();
    } else {
      req.continue();
    }
  });

  return page;
};

export const closePage = async (page: Page) => {
  if (page && !page.isClosed()) {
    try {
      await page.close();
    } catch (err) {
      console.error('Error closing page:', (err as Error).message);
    }
  }
};

export const close = async (browserInstance?: Browser) => {
    const b = browserInstance || browser;
    if (b) {
        try {
        await b.close();
        if (b === browser) {
            browser = null;
        }
        } catch (err) {
        console.error('Error closing browser:', (err as Error).message);
        }
    }
};

export type { Browser, Page };
