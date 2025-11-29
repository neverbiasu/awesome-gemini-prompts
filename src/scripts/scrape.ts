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
  console.log('🕷️  Scraping Web Sources...');
  const webPrompts = await scrapeWeb();
  await fs.writeFile(path.join(DATA_DIR, 'web.json'), JSON.stringify(webPrompts, null, 2));
  console.log(`💾 Saved ${webPrompts.length} web prompts to web.json`);

  console.log('🕷️  Scraping GitHub...');
  const githubPrompts = await scrapeGithub(); 
  await fs.writeFile(path.join(DATA_DIR, 'github.json'), JSON.stringify(githubPrompts, null, 2));
  console.log(`💾 Saved ${githubPrompts.length} github prompts to github.json`);

  console.log('🕷️  Scraping Reddit...');
  const redditPrompts = await scrapeReddit();
  await fs.writeFile(path.join(DATA_DIR, 'reddit.json'), JSON.stringify(redditPrompts, null, 2));
  console.log(`💾 Saved ${redditPrompts.length} reddit prompts to reddit.json`);
  
  // 3. Load Manual Data (AI Studio)
  let manualPrompts: any[] = [];
  try {
    const manualFileContent = await fs.readFile(path.join(DATA_DIR, 'aistudio.json'), 'utf-8');
    manualPrompts = JSON.parse(manualFileContent);
    console.log(`📖 Loaded ${manualPrompts.length} manual prompts from aistudio.json`);
  } catch (e) {
    console.warn("   ⚠️ Could not load aistudio.json (it might be empty or missing).");
  }

  // 4. Combine all raw data
  const rawCandidates = [
    ...manualPrompts, 
    ...webPrompts,
    ...githubPrompts,
    ...redditPrompts
  ];
  
  await fs.writeFile(RAW_FILE, JSON.stringify(rawCandidates, null, 2));
  console.log(`✅ Saved ${rawCandidates.length} combined raw candidates to ${RAW_FILE}`);
}

main().catch(console.error);
