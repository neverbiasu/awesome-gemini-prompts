import { chromium } from 'playwright';
import { GeminiPrompt } from '../../schema/prompt';

export async function scrapeWeb(): Promise<GeminiPrompt[]> {
  console.log('🕷️ Starting Web Scraper (Target: Google AI Prompts Gallery)...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const prompts: GeminiPrompt[] = [];

  try {
    const page = await context.newPage();
    
    // 1. Navigate to Gallery
    const targetUrl = 'https://ai.google.dev/gemini-api/prompts';
    console.log(`   Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 2. Extract List Items
    const cards = await page.evaluate(() => {
      const elements = document.querySelectorAll('.gemini-gradient-CTA_wrapper a');
      return Array.from(elements).map(el => ({
        title: el.querySelector('h3')?.innerText?.trim() || "Untitled",
        description: el.querySelector('p')?.innerText?.trim() || "",
        url: (el as HTMLAnchorElement).href
      }));
    });
    console.log(`   Found ${cards.length} prompt cards.`);

    // 3. Map to GeminiPrompt (Metadata only)
    for (const card of cards) {
       prompts.push({
         id: crypto.randomUUID(),
         title: card.title,
         promptText: card.description || card.title, // Placeholder
         description: card.description,
         tags: ["official", "google"],
         sourcePlatform: "official_docs",
         originUrl: card.url,
         modelTarget: ["gemini-1.5-pro"],
         inputModality: ["text"],
         outputModality: ["text"],
         fetchedAt: new Date().toISOString(),
         author: { name: "Google", profileUrl: "https://ai.google.dev" },
         confidenceScore: 0.8 
       });
    }

  } catch (error: any) {
    console.error('❌ Web scraping failed:', error.message || error);
  } finally {
    await browser.close();
  }

  return prompts;
}
