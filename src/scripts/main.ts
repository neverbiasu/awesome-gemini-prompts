import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { PromptSchema, GeminiPrompt } from '../schema/prompt';
import { scrapeWeb } from './scraper/web-scraper';
import { scrapeGithub } from './scraper/github-scraper';
import { scrapeReddit } from './scraper/reddit-scraper';
import { cleanPromptsWithLLM } from './cleaner';

// Define the path to the data file
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'prompts.json');

async function main() {
  console.log('🚀 Starting Gemini Prompt Scraper...');

  // 1. Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  // 2. Load existing data (to prevent duplicates / enable updates)
  let existingPrompts: GeminiPrompt[] = [];
  try {
    const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
    existingPrompts = JSON.parse(fileContent);
    console.log(`📦 Loaded ${existingPrompts.length} existing prompts.`);
  } catch (error) {
    console.log('Mw Creating new data file.');
  }

  // 3. Run Scrapers
  const webPrompts = await scrapeWeb();
  const githubPrompts = await scrapeGithub();
  const redditPrompts = await scrapeReddit();
  
  const rawCandidates = [
    ...webPrompts,
    ...githubPrompts,
    ...redditPrompts
  ];

  // 4. Clean Data with LLM
  const cleanedPrompts = await cleanPromptsWithLLM(rawCandidates);
  
  // 5. Merge and Save (Simple deduplication by originUrl)
  const allPrompts = [...existingPrompts];
  
  for (const newP of cleanedPrompts) {
    const exists = allPrompts.some(p => p.originUrl === newP.originUrl);
    if (!exists) {
      allPrompts.push(newP);
    }
  }

  // Add the hardcoded placeholder prompt if it doesn't exist
  const placeholderExists = allPrompts.some(p => p.title === "Advanced Coding Assistant");
  if (!placeholderExists) {
      allPrompts.push({
        id: crypto.randomUUID(),
        title: "Advanced Coding Assistant",
        promptText: "Act as an expert software engineer...",
        tags: ["coding", "python"],
        originUrl: "https://github.com/google/gemini-cookbook",
        sourcePlatform: "github",
        modality: ["text"],
        fetchedAt: new Date().toISOString()
      });
  }

  // 6. Save to JSON
  await fs.writeFile(DATA_FILE, JSON.stringify(allPrompts, null, 2));
  console.log(`✅ Successfully saved ${allPrompts.length} prompts to ${DATA_FILE}`);
}

main().catch(console.error);
