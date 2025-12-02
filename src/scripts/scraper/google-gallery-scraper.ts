import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Define a local schema for the raw scraped data
const GoogleGallerySchema = z.object({
  title: z.string(),
  description: z.string(), // This will be used as the prompt content
  url: z.string(),
  tags: z.array(z.string()).default([]),
});

type GoogleGalleryItem = z.infer<typeof GoogleGallerySchema>;

async function scrapeGoogleGallery() {
  console.log('Starting Google Gallery Scraper...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = 'https://ai.google.dev/gemini-api/prompts';

  try {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000); // Wait for dynamic content

    // Extract data from cards
    console.log('Extracting prompts from gallery cards...');
    const rawPrompts = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a'));
      return cards
        .filter(card => card.href.includes('prompts/'))
        .map(card => {
          const text = card.innerText.trim();
          const parts = text.split('\n').filter(line => line.trim() !== '');
          const title = parts[0] || 'Untitled';
          const description = parts.slice(1).join('\n').trim();
          
          return {
            title,
            description,
            url: card.href,
            tags: ['google', 'official'] // Default tags
          };
        });
    });

    console.log(`Found ${rawPrompts.length} potential prompts.`);

    const validPrompts: GoogleGalleryItem[] = [];

    for (const raw of rawPrompts) {
      // Strict validation: Must have a description (prompt content)
      if (!raw.description || raw.description.length < 10) {
        console.log(`Skipping "${raw.title}": No valid description/content found.`);
        continue;
      }

      validPrompts.push({
        title: raw.title,
        description: raw.description,
        url: raw.url,
        tags: raw.tags
      });
    }

    console.log(`Successfully extracted ${validPrompts.length} valid prompts.`);

    // Save to file
    const outputDir = path.resolve(process.cwd(), 'data');
    // Check if directory exists, if not create it.
    try {
        await fs.access(outputDir);
    } catch {
        await fs.mkdir(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'google_gallery.json');
    await fs.writeFile(outputPath, JSON.stringify(validPrompts, null, 2));
    console.log(`Saved data to ${outputPath}`);

  } catch (error) {
    console.error('Error scraping Google Gallery:', error);
  } finally {
    await browser.close();
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGoogleGallery();
}

export { scrapeGoogleGallery };
