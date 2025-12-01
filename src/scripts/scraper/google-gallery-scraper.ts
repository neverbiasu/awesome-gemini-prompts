import { chromium } from 'playwright';
import { GeminiPrompt } from '../../schema/prompt';
import fs from 'fs/promises';
import path from 'path';

export async function scrapeGoogleGallery(): Promise<GeminiPrompt[]> {
  console.log('🕷️ Starting Google Gallery Scraper (Strict Mode)...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const prompts: GeminiPrompt[] = [];

  try {
    const page = await context.newPage();
    const targetUrl = 'https://ai.google.dev/gemini-api/prompts';
    
    console.log(`   Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Extract List Items
    const cards = await page.evaluate(() => {
      const elements = document.querySelectorAll('.gemini-gradient-CTA_wrapper a');
      return Array.from(elements).map(el => ({
        title: el.querySelector('h3')?.innerText?.trim() || "Untitled",
        description: el.querySelector('p')?.innerText?.trim() || "",
        url: (el as HTMLAnchorElement).href
      }));
    });
    console.log(`   Found ${cards.length} potential prompts.`);

    // Extract Details from Each Page
    for (const [index, card] of cards.entries()) {
        try {
            console.log(`   [${index + 1}/${cards.length}] Scraping: ${card.title}`);
            await page.goto(card.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
            
            // Wait for content to load
            await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});

            const details = await page.evaluate(() => {
                // Strict extraction: We MUST find code blocks or specific content containers.
                // If we fallback to body text, we get garbage.
                const codeBlocks = Array.from(document.querySelectorAll('pre, code, .code-block, .prompt-content'));
                
                // Filter out short snippets that might be UI elements
                const validBlocks = codeBlocks
                    .map(cb => cb.textContent?.trim())
                    .filter(text => text && text.length > 20);

                if (validBlocks.length === 0) return null;

                return {
                    fullText: validBlocks.join('\n\n')
                };
            });

            if (!details || !details.fullText) {
                console.warn(`      ⚠️ Skipping "${card.title}" - Could not extract valid prompt text.`);
                continue;
            }

            prompts.push({
                id: crypto.randomUUID(),
                title: card.title,
                description: card.description,
                tags: ["official", "google"],
                originalSourceUrl: card.url,
                compatibleModels: ["gemini-1.5-pro", "gemini-1.5-flash"],
                
                contents: [{
                    role: "user",
                    parts: [{ text: details.fullText }]
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
            console.warn(`      ❌ Error scraping "${card.title}": ${err.message}`);
        }
    }

  } catch (error: any) {
    console.error('❌ Google Gallery scraping failed:', error.message || error);
  } finally {
    await browser.close();
  }

  // Save to dedicated file
  if (prompts.length > 0) {
      const outputPath = path.join(process.cwd(), 'data', 'google_gallery.json');
      await fs.writeFile(outputPath, JSON.stringify(prompts, null, 2));
      console.log(`✅ Saved ${prompts.length} valid Google prompts to data/google_gallery.json`);
  } else {
      console.warn("⚠️ No valid Google prompts found. Nothing saved.");
  }

  return prompts;
}
