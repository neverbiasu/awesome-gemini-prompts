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
    // 3. Extract Details from Each Page
    console.log(`   Extracting details for ${cards.length} prompts...`);
    
    for (const [index, card] of cards.entries()) {
        try {
            console.log(`   [${index + 1}/${cards.length}] Scraping: ${card.title}`);
            await page.goto(card.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            
            // Wait for content to load
            await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});

            const details = await page.evaluate(() => {
                // Try to find the prompt text. This is a best-guess based on common structure.
                // We look for code blocks or specific containers.
                const codeBlocks = Array.from(document.querySelectorAll('pre, code, .code-block'));
                const mainText = codeBlocks.map(cb => cb.textContent).join('\n\n') || 
                                 document.querySelector('main')?.innerText || 
                                 document.body.innerText;
                
                return {
                    fullText: mainText.trim()
                };
            });

            prompts.push({
                id: crypto.randomUUID(),
                title: card.title,
                description: card.description,
                tags: ["official", "google"],
                originalSourceUrl: card.url,
                compatibleModels: ["gemini-1.5-pro", "gemini-1.5-flash"], // Inferred broad compatibility
                
                contents: [{
                    role: "user",
                    parts: [{ text: details.fullText || card.description || card.title }]
                }],
                
                author: { 
                    name: "Google", 
                    url: "https://ai.google.dev",
                    platform: "Google"
                },
                stats: { views: 0, copies: 0, likes: 0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Small delay to be nice
            await page.waitForTimeout(1000);

        } catch (err: any) {
            console.warn(`   ⚠️ Failed to scrape details for ${card.title}: ${err.message}`);
            // Fallback to basic info
            prompts.push({
                id: crypto.randomUUID(),
                title: card.title,
                description: card.description,
                tags: ["official", "google"],
                originalSourceUrl: card.url,
                compatibleModels: ["gemini-1.5-pro"],
                contents: [{
                    role: "user",
                    parts: [{ text: card.description || card.title }]
                }],
                author: { name: "Google", url: "https://ai.google.dev", platform: "Google" },
                stats: { views: 0, copies: 0, likes: 0 },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }

  } catch (error: any) {
    console.error('❌ Web scraping failed:', error.message || error);
  } finally {
    await browser.close();
  }

  return prompts;
}
