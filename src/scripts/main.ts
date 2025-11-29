import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { PromptSchema, GeminiPrompt } from '../schema/prompt';
import { scrapeWeb } from './scraper/web-scraper';
import { scrapeGithub } from './scraper/github-scraper';
import { scrapeReddit } from './scraper/reddit-scraper';
import { cleanPromptsWithLLM } from './cleaner';

// Define the path to the data files
const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const RAW_FILE = path.join(DATA_DIR, 'raw.json');

async function main() {
  console.log('🚀 Starting Gemini Prompt Scraper & Pipeline...');

  // 1. Ensure data directory exists
  await fs.mkdir(DATA_DIR, { recursive: true });

  // 2. Load existing production data (to prevent duplicates in final output)
  let existingPrompts: GeminiPrompt[] = [];
  try {
    const fileContent = await fs.readFile(PROMPTS_FILE, 'utf-8');
    existingPrompts = JSON.parse(fileContent);
    console.log(`📦 Loaded ${existingPrompts.length} existing production prompts.`);
  } catch (error) {
    console.log('Mw Creating new production data file.');
  }

  // 3. Run Scrapers
  const webPrompts = await scrapeWeb();
  await fs.writeFile(path.join(DATA_DIR, 'web.json'), JSON.stringify(webPrompts, null, 2));
  console.log(`💾 Saved ${webPrompts.length} web prompts to web.json`);

  const githubPrompts = await scrapeGithub(); 
  await fs.writeFile(path.join(DATA_DIR, 'github.json'), JSON.stringify(githubPrompts, null, 2));
  console.log(`💾 Saved ${githubPrompts.length} github prompts to github.json`);

  const redditPrompts = await scrapeReddit();
  await fs.writeFile(path.join(DATA_DIR, 'reddit.json'), JSON.stringify(redditPrompts, null, 2));
  console.log(`💾 Saved ${redditPrompts.length} reddit prompts to reddit.json`);
  
  // Load Manual Data (AI Studio)
  let manualPrompts: any[] = [];
  try {
    const manualFileContent = await fs.readFile(path.join(DATA_DIR, 'aistudio.json'), 'utf-8');
    manualPrompts = JSON.parse(manualFileContent);
    console.log(`📖 Loaded ${manualPrompts.length} manual prompts from aistudio.json`);
  } catch (e) {
    console.warn("   ⚠️ Could not load aistudio.json (it might be empty or missing).");
  }

  const rawCandidates = [
    ...manualPrompts, // Priority: Manual prompts first? Or last? Order doesn't matter for dedupe if we use URL.
    ...webPrompts,
    ...githubPrompts,
    ...redditPrompts
  ];
  
  console.log(`💾 Saved ${rawCandidates.length} combined raw candidates to ${RAW_FILE}`);

  // 5. Clean Data with LLM
  // We only want to clean candidates that are NOT already in our production DB (by URL)
  // This saves API costs and time.
  const newCandidates = rawCandidates.filter(candidate => {
     // If no originUrl, we can't dedup easily, so treat as new.
     if (!candidate.originUrl) return true;
     return !existingPrompts.some(p => p.originUrl === candidate.originUrl);
  });

  console.log(`🔍 Found ${newCandidates.length} new candidates to clean (deduplicated against existing).`);

  let cleanedPrompts: GeminiPrompt[] = [];
  if (newCandidates.length > 0) {
      cleanedPrompts = await cleanPromptsWithLLM(newCandidates);
  } else {
      console.log("✨ No new candidates to clean.");
  }
  
  // 6. Merge and Save
  const allPrompts = [...existingPrompts, ...cleanedPrompts];
  
  // Add the hardcoded placeholder prompt if it doesn't exist (and if DB is empty)
  if (allPrompts.length === 0) {
      const placeholderExists = allPrompts.some(p => p.title === "Advanced Coding Assistant");
      if (!placeholderExists) {
          allPrompts.push({
            id: crypto.randomUUID(),
            title: "Advanced Coding Assistant",
            promptText: "Act as an expert software engineer...",
            tags: ["coding", "python"],
            originUrl: "https://github.com/google/gemini-cookbook",
            sourcePlatform: "github",
            inputModality: ["text"],
            outputModality: ["code"],
            modelTarget: ["gemini-1.5-pro"],
            confidenceScore: 1.0,
            author: {
               name: "Google",
               profileUrl: "https://github.com/google"
            },
            fetchedAt: new Date().toISOString()
          });
      }
  }

  // 7. Save to JSON
  await fs.writeFile(PROMPTS_FILE, JSON.stringify(allPrompts, null, 2));
  console.log(`✅ Successfully saved ${allPrompts.length} prompts to ${PROMPTS_FILE}`);
}

main().catch(console.error);
