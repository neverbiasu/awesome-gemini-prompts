import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { PromptSchema, GeminiPrompt } from '../schema/prompt';
import { scrapeWeb } from './scraper/web-scraper';
import { scrapeGithub } from './scraper/github-scraper';

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
  
  const newPrompts: GeminiPrompt[] = [
    ...webPrompts,
    ...githubPrompts,
    {
      id: crypto.randomUUID(),
      title: "Advanced Coding Assistant",
      promptText: "You are an expert software engineer...",
      tags: ["coding", "python"],
      originUrl: "https://github.com/example/prompt",
      sourcePlatform: "github",
      modality: ["text"],
      fetchedAt: new Date().toISOString(),
    }
  ];

  // 4. Merge and Deduplicate
  // Simple deduplication by Source URL
  const promptMap = new Map<string, GeminiPrompt>();
  
  // Load existing first
  existingPrompts.forEach(p => promptMap.set(p.originUrl, p));
  // Overwrite with new (updates)
  newPrompts.forEach(p => promptMap.set(p.originUrl, p));

  const mergedPrompts = Array.from(promptMap.values());

  // 5. Validate Data
  const validPrompts: GeminiPrompt[] = [];
  for (const p of mergedPrompts) {
    const result = PromptSchema.safeParse(p);
    if (result.success) {
      validPrompts.push(result.data);
    } else {
      console.warn(`⚠️ Invalid prompt skipped: ${p.title}`, result.error.flatten());
    }
  }

  // 6. Write to file
  await fs.writeFile(DATA_FILE, JSON.stringify(validPrompts, null, 2));
  console.log(`✅ Successfully saved ${validPrompts.length} prompts to ${DATA_FILE}`);
}

main().catch(console.error);
