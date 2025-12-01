import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { scrapeWeb } from './scraper/web-scraper';
import { scrapeGithub } from './scraper/github-scraper';
import { scrapeReddit } from './scraper/reddit-scraper';

// Define the path to the data files
const DATA_DIR = path.join(process.cwd(), 'data');
const RAW_FILE = path.join(DATA_DIR, 'raw.json');

async function main() {
  console.log('🚀 Starting Gemini Prompt Scraper...');

  // 1. Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  // 2. Run Scrapers
  console.log('🕷️  Scraping Web Sources (AI Studio)...');
  const webPrompts = await scrapeWeb();
  await fs.writeFile(path.join(DATA_DIR, 'aistudio_scraped.json'), JSON.stringify(webPrompts, null, 2));
  console.log(`💾 Saved ${webPrompts.length} prompts to aistudio_scraped.json`);

  console.log('🕷️  Scraping GitHub...');
  const githubPrompts = await scrapeGithub(); 
  await fs.writeFile(path.join(DATA_DIR, 'github.json'), JSON.stringify(githubPrompts, null, 2));
  console.log(`💾 Saved ${githubPrompts.length} github prompts to github.json`);

  // 3. Merge and Save Reddit Prompts (Preserve History)
  console.log('🕷️  Scraping Reddit...');
  const newRedditPrompts = await scrapeReddit();
  
  let existingRedditPrompts: any[] = [];
  try {
    const redditFileContent = await fs.readFile(path.join(DATA_DIR, 'reddit.json'), 'utf-8');
    existingRedditPrompts = JSON.parse(redditFileContent);
  } catch (error) {
    // File might not exist yet
  }

  // Dedup by URL
  const redditMap = new Map();
  existingRedditPrompts.forEach(p => redditMap.set(p.url, p));
  newRedditPrompts.forEach(p => redditMap.set(p.url, p)); // New overwrites old (updates stats)

  const mergedRedditPrompts = Array.from(redditMap.values());
  await fs.writeFile(path.join(DATA_DIR, 'reddit.json'), JSON.stringify(mergedRedditPrompts, null, 2));
  console.log(`💾 Saved ${mergedRedditPrompts.length} reddit prompts to reddit.json (Merged ${newRedditPrompts.length} new)`);

  console.log('✅ Scrape completed. Data saved to individual JSON files.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
