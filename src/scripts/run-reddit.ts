import { scrapeReddit } from './scraper/reddit-scraper';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
    console.log("Testing Reddit Scraper (Refactored)...");
    const prompts = await scrapeReddit();
    console.log(`Found ${prompts.length} prompts.`);
    if (prompts.length > 0) {
        console.log('Sample:', JSON.stringify(prompts[0], null, 2));
        await fs.writeFile('data/reddit_test.json', JSON.stringify(prompts, null, 2));
    }
}

main();
