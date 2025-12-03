import { chromium, BrowserContext } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { z } from 'zod';

// Define schema for the scraped data
const GoogleGallerySchema = z.object({
  title: z.string(),
  description: z.string(),
  url: z.string(),
  tags: z.array(z.string()).default([]),
  systemInstructions: z.string().optional(),
  userPrompt: z.string().optional(),
  model: z.string().optional(),
});

type GoogleGalleryItem = z.infer<typeof GoogleGallerySchema>;

async function scrapeGoogleGallery() {
  console.log('🚀 Starting Google Gallery Scraper (Persistent Context)...');
  
  // Path to Chrome User Data Directory
  // On macOS: ~/Library/Application Support/Google/Chrome
  // We use a specific profile or the default one. 
  // WARNING: Chrome must be CLOSED for this to work if using the default profile.
  const userDataDir = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
  
  console.log(`📂 Using User Data Dir: ${userDataDir}`);
  console.log('⚠️  NOTE: If this fails, please ensure Google Chrome is completely CLOSED.');

  let context: BrowserContext;

  try {
    context = await chromium.launchPersistentContext(userDataDir, {
      headless: false, // Must be false to see what's happening and for some auth flows
      channel: 'chrome', // Use actual Chrome
      viewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Standard flags
    });
  } catch (error) {
    console.error('❌ Failed to launch persistent context. Is Chrome open?');
    console.error(error);
    return;
  }

  const page = await context.newPage();
  const url = 'https://ai.google.dev/gemini-api/prompts';

  try {
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // Wait for hydration

    // 1. Get List of Links
    console.log('🔍 Extracting prompt links...');
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter(a => a.href.includes('/gemini-api/prompts/'))
        .map(a => a.href)
        .filter((v, i, a) => a.indexOf(v) === i); // Dedupe
    });

    console.log(`Found ${links.length} prompt links.`);

    const validPrompts: GoogleGalleryItem[] = [];

    // 2. Visit each link (Limit to 5 for testing if needed, but we want all)
    for (const link of links) {
      console.log(`\n📄 Scraping: ${link}`);
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);

        // Extract Details
        const data = await page.evaluate(() => {
          const title = document.querySelector('h1')?.innerText.trim() || 'Untitled';
          const description = document.querySelector('p')?.innerText.trim() || '';
          
          // Try to find System Instructions
          // Strategy: Look for headers or specific containers
          // This is heuristic and might need adjustment based on actual DOM
          let systemInstructions = '';
          let userPrompt = '';
          
          // Example heuristic: Look for code blocks or specific labels
          // Note: This is a best-guess without seeing the DOM. 
          // We grab all text for now or look for specific sections if possible.
          
          const bodyText = document.body.innerText;
          
          // Simple extraction for now - refine later with actual selectors
          return {
            title,
            description,
            systemInstructions: '', // Placeholder
            userPrompt: '' // Placeholder
          };
        });

        // Refined extraction using Playwright locators for better precision
        // Assuming standard layout: Title, Description, "System Instructions" block, "User Prompt" block
        
        // Try to find "System Instructions" header and following content
        const sysInstrHeader = page.getByText('System Instructions', { exact: false });
        if (await sysInstrHeader.count() > 0) {
            // This is tricky without specific selectors. 
            // Often it's in a code block or a specific div following the header.
            // For now, we'll try to grab the next sibling or a code block nearby.
             const content = await page.evaluate(() => {
                const headers = Array.from(document.querySelectorAll('h2, h3, h4, div'));
                const sysHeader = headers.find(h => h.textContent?.includes('System Instructions'));
                if (sysHeader) {
                    // Try to find a code block or text following it
                    let next = sysHeader.nextElementSibling;
                    while (next) {
                        if (next.tagName === 'PRE' || next.classList.contains('code-block')) {
                            return next.textContent || '';
                        }
                        next = next.nextElementSibling;
                    }
                }
                return '';
             });
             data.systemInstructions = content || '';
        }

        validPrompts.push({
          title: data.title,
          description: data.description,
          url: link,
          tags: ['google', 'official'],
          systemInstructions: data.systemInstructions,
          userPrompt: data.userPrompt
        });

      } catch (e) {
        console.error(`Failed to scrape ${link}:`, e);
      }
    }

    console.log(`\n✅ Successfully extracted ${validPrompts.length} prompts.`);

    // Save to file
    const outputDir = path.resolve(process.cwd(), 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, 'google_gallery.json');
    await fs.writeFile(outputPath, JSON.stringify(validPrompts, null, 2));
    console.log(`💾 Saved data to ${outputPath}`);

  } catch (error) {
    console.error('❌ Error scraping Google Gallery:', error);
  } finally {
    await context.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGoogleGallery();
}

export { scrapeGoogleGallery };
