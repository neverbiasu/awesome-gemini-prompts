import { chromium } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GeminiPrompt } from '../schema/prompt';

// Configuration
const TARGET_ACCOUNTS = [
  // Official & Core
  'GoogleDeepMind',
  'GeminiApp',
  'GoogleLabs',
  'NotebookLM',
  'googleaidevs',
  'GoogleAIStudio',
  
  // Influencers & Creators
  'NanoBanana',
  'nutlope',
  'svpino',
  'rowancheung',
  'alexalbert__',
  'lilianweng',
  'karpathy',
  'bindureddy',
  'ylecun',
  'fofrAI',
  'godofprompt',
  'aiwithjainam',
  'ShreyaYadav___',
  'AiwithSaad',
  'Whizz_ai',
  'MimiTheDesigner',
  'AlexRiad84837',
  'JihadSameul',
  'Emmgkreativity',
  'CodebyNihan',
  'YaseenK7212',
  'xmliisu',
  'ZaraIrahh',
  'saniaspeaks_',
  'SimplyAnnisa',
  'NanoBanana_labs',
  'LearnWithAbbay',
  'lexx_aura',
  'dotey',
  'CodeByPoonam'
];

const OUTPUT_FILE = path.join(process.cwd(), 'data', 'x.json');

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function savePromptsToXJson(newPrompts: GeminiPrompt[]) {
    let existingPrompts: GeminiPrompt[] = [];
    try {
        const content = await fs.readFile(OUTPUT_FILE, 'utf-8');
        existingPrompts = JSON.parse(content);
    } catch (error) {
        // File doesn't exist or is invalid, start fresh
    }

    // Merge and Deduplicate (by ID)
    const promptMap = new Map<string, GeminiPrompt>();
    existingPrompts.forEach(p => promptMap.set(p.id, p));
    newPrompts.forEach(p => promptMap.set(p.id, p)); // Overwrite with newer

    const mergedPrompts = Array.from(promptMap.values());
    
    await ensureDir(path.dirname(OUTPUT_FILE));
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(mergedPrompts, null, 2));
    console.log(`✅ Saved ${newPrompts.length} new prompts to ${OUTPUT_FILE} (Total: ${mergedPrompts.length})`);
}

function extractPromptFromText(text: string): string | null {
    const isPrompt = text.toLowerCase().includes('prompt:') || 
                     text.toLowerCase().includes('gemini') ||
                     text.includes('```');
    if (!isPrompt) return null;

    let promptText = text;
    const promptMatch = text.match(/Prompt:\s*([\s\S]*?)(?:\n\n|$)/i);
    if (promptMatch) {
        promptText = promptMatch[1].trim();
    }
    return promptText;
}

async function scrapeUserTimeline(page: any, username: string) {
    console.log(`\n🐦 Visiting @${username}...`);
    await page.goto(`https://twitter.com/${username}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Check for Login Wall
    if (await page.getByText('Sign in to X').isVisible()) {
        console.warn(`⚠️ Hit Login Wall for @${username}. Skipping.`);
        return [];
    }

    // Auto-scroll
    console.log('   Scrolling to load more content...');
    for (let i = 0; i < 5; i++) { // Scroll more
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1500);
    }

    return extractTweetsFromPage(page, username);
}

async function scrapeUserSearch(page: any, username: string) {
    // Search query: "from:username prompt OR gemini"
    const query = `from:${username} (prompt OR gemini OR instruction)`;
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://twitter.com/search?q=${encodedQuery}&src=typed_query&f=live`;

    console.log(`\n🔍 Searching @${username} for prompts: "${query}"...`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    // Check for Login Wall or No Results
    if (await page.getByText('Sign in to X').isVisible()) {
        console.warn(`⚠️ Hit Login Wall for search @${username}. Skipping.`);
        return [];
    }
    
    // Auto-scroll (Search results need scrolling too)
    console.log('   Scrolling search results...');
    for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 1000);
        await page.waitForTimeout(1500);
    }

    return extractTweetsFromPage(page, username);
}

async function extractTweetsFromPage(page: any, username: string) {
    const tweetElements = await page.locator('article[data-testid="tweet"]').all();
    console.log(`   Found ${tweetElements.length} visible tweets.`);

    const prompts: GeminiPrompt[] = [];
    for (const tweetEl of tweetElements) {
        const text = await tweetEl.locator('[data-testid="tweetText"]').innerText().catch(() => '');
        
        // Detect Images
        const photo = await tweetEl.locator('[data-testid="tweetPhoto"]').first();
        const hasImage = await photo.count() > 0;
        let imageUrl = '';
        if (hasImage) {
             imageUrl = await photo.locator('img').getAttribute('src').catch(() => '') || '';
        }

        // --- Stricter Filtering Logic ---
        const lowerText = text.toLowerCase();
        let promptText: string | null = null;

        // 1. Negative Keywords (Skip news/comparisons/hate unless strictly a prompt)
        const isNoise = ['news', 'update', 'vs', 'comparison', 'review', 'hate', 'sucks', 'opinion'].some(k => lowerText.includes(k));
        const hasPromptKeyword = lowerText.includes('prompt:') || lowerText.includes('try this') || lowerText.includes('instructions:');
        
        if (isNoise && !hasPromptKeyword) continue;

        // 2. Extraction Strategy
        if (hasPromptKeyword || text.includes('```')) {
            // High Confidence: Has "Prompt:" or Code Block
            const promptMatch = text.match(/(?:Prompt|Try this|System Instruction):\s*([\s\S]*?)(?:\n\n|$)/i);
            promptText = promptMatch ? promptMatch[1].trim() : text;
        } else if (hasImage) {
            // Medium Confidence: Has Image + decent amount of text (likely image generation prompt)
            // Filter out short captions like "Cool pic"
            if (text.length > 20) {
                promptText = text;
            }
        } else if (lowerText.includes('gemini') && text.length > 100) {
            // Low Confidence (Text Only): Must be long and mention Gemini (likely a complex prompt share)
            // prevent short tweets like "Gemini is great"
            promptText = text;
        }

        // Final Filter: if no promptText identified, skip
        if (!promptText) continue;

        // Clean up common "Show more" artifacts if scraped text includes it (rare with innerText but possible)
        promptText = promptText.replace(/Show more$/, '').trim();

        if (promptText.length > 10) { 
             // Extract Likes
             let likes = 0;
             try {
                 const likeLabel = await tweetEl.locator('[data-testid="like"]').getAttribute('aria-label');
                 // aria-label format: "156 likes" or "156 Likes"
                 if (likeLabel) {
                     const match = likeLabel.match(/(\d+(?:,\d+)*)\s*likes?/i);
                     if (match) {
                         likes = parseInt(match[1].replace(/,/g, ''), 10);
                     }
                 }
                 // Fallback: try to read the text content if aria-label fails (sometimes it's just a number)
                 if (likes === 0) {
                      const likeText = await tweetEl.locator('[data-testid="like"] [data-testid="app-text-transition-container"]').innerText().catch(() => '');
                      if (likeText) {
                          // Handle K, M suffixes
                          let multiplier = 1;
                          let numStr = likeText.toUpperCase();
                          if (numStr.includes('K')) { multiplier = 1000; numStr = numStr.replace('K', ''); }
                          else if (numStr.includes('M')) { multiplier = 1000000; numStr = numStr.replace('M', ''); }
                          likes = Math.floor(parseFloat(numStr) * multiplier);
                      }
                 }
             } catch (e) {
                 // Ignore like extraction errors
             }

             const timeEl = tweetEl.locator('time');
             const timestamp = await timeEl.getAttribute('datetime').catch(() => new Date().toISOString());
             const link = await tweetEl.locator('a[href*="/status/"]').first().getAttribute('href').catch(() => '');
             const tweetId = link ? link.split('/').pop() : Date.now().toString();

             prompts.push({
                  id: `twitter-${tweetId}`,
                  title: `Tweet by @${username}`,
                  description: text.substring(0, 100) + '...',
                  tags: [], // Leave empty for LLM to fill
                  author: {
                      name: `@${username}`,
                      url: `https://twitter.com/${username}`,
                      platform: 'Twitter' as any // Cast to any to avoid type error until schema is updated
                  },
                  originalSourceUrl: `https://twitter.com${link}`,
                  contents: [{
                      role: 'user',
                      parts: [
                        { text: promptText },
                        // Add image if present (as a text note for now, or structured if schema supports)
                        ...(imageUrl ? [{ text: `[Image Attachment: ${imageUrl}]` }] : [])
                      ]
                  }],
                  stats: { views: 0, likes: likes, copies: 0 },
                  compatibleModels: ["gemini-2.5-flash"],
                  modality: hasImage ? ['image'] : ['text'],
                  createdAt: timestamp || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
              });
        }
    }
    return prompts;
}

async function main() {
  console.log('🚀 Starting Playwright Twitter Scraper (Guest Mode)...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  for (const username of TARGET_ACCOUNTS) {
      const page = await context.newPage();
      try {
          // Strategy: Try Search first (more targeted), then fallback to Timeline if empty?
          // Or just do both? Let's do Search as it matches the user's "recursive query" request better.
          
          let prompts = await scrapeUserSearch(page, username);
          
          if (prompts.length === 0) {
              console.log(`   Search returned 0 results. Falling back to Timeline...`);
              prompts = await scrapeUserTimeline(page, username);
          }

          if (prompts.length > 0) {
              // Deduplicate locally before saving
              const uniquePrompts = Array.from(new Map(prompts.map(p => [p.id, p])).values());
              console.log(`   Found ${uniquePrompts.length} unique prompts.`);
              await savePromptsToXJson(uniquePrompts);
          } else {
              console.log(`   No prompts found for @${username} (Search & Timeline).`);
          }

      } catch (error) {
          console.error(`❌ Error scraping @${username}:`, error);
      } finally {
          await page.close();
      }
  }

  await browser.close();
  console.log('\n✨ Scraper finished.');
}

main().catch(console.error);
