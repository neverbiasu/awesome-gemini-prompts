/**
 * X/Twitter Scraper using FxTwitter API
 * 
 * This scraper uses the FxTwitter API to fetch tweet data without:
 * - Playwright/browser automation
 * - API keys
 * - User authentication
 * 
 * Usage:
 *   bun src/scripts/scraper/x-fxtwitter-scraper.ts
 */

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'x.json');

// Accounts known to share Gemini prompts
const PROMPT_ACCOUNTS = [
    'NanoBanana',
    'GeminiApp', 
    'GoogleAI',
    'GoogleDeepMind',
    // Add more accounts here
];

// Search queries to find prompts via Google (for manual discovery)
const SEARCH_QUERIES = [
    'site:twitter.com OR site:x.com "gemini prompt"',
    'site:twitter.com OR site:x.com "nano banana" prompt',
    'site:twitter.com OR site:x.com "system instruction" gemini',
];

interface FxTweet {
    code: number;
    tweet: {
        id: string;
        url: string;
        text: string;
        author: {
            name: string;
            screen_name: string;
            followers: number;
        };
        likes: number;
        retweets: number;
        views: number;
        created_at: string;
        created_timestamp: number;
        media?: {
            photos?: Array<{ url: string }>;
            videos?: Array<{ url: string }>;
        };
    };
}

interface ScrapedPrompt {
    id: string;
    title: string;
    description: string;
    promptText: string;
    tags: string[];
    author: {
        name: string;
        url: string;
        platform: string;
    };
    originalSourceUrl: string;
    stats: {
        likes: number;
        views: number;
        retweets: number;
    };
    createdAt: string;
    source: string;
}

// Fetch a single tweet via FxTwitter API
async function fetchTweet(tweetId: string): Promise<FxTweet | null> {
    try {
        const response = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
        if (!response.ok) {
            console.warn(`   ⚠️ Failed to fetch tweet ${tweetId}: ${response.status}`);
            return null;
        }
        return await response.json() as FxTweet;
    } catch (error) {
        console.error(`   ❌ Network error fetching ${tweetId}`);
        return null;
    }
}

// Fetch latest tweets from an account's timeline (limited without auth)
async function fetchAccountTweets(username: string, count: number = 20): Promise<string[]> {
    // FxTwitter doesn't support timeline fetching directly
    // We need to get tweet IDs from another source
    // For now, return empty - we'll populate this with known IDs
    console.log(`   ⚠️ Timeline scraping requires known tweet IDs for @${username}`);
    return [];
}

// Check if tweet contains a prompt
function isPromptTweet(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    // Must contain prompt-related keywords
    const hasPromptKeyword = [
        'prompt:', 'prompt -', 'here\'s a prompt',
        'try this prompt', 'system instruction',
        'gemini prompt', 'nano banana',
        '[reference image]', 'image{', 'scene:',
    ].some(kw => lowerText.includes(kw));
    
    // Exclude news/announcements
    const isNews = [
        'announcing', 'we\'re excited', 'introducing',
        'now available', 'coming soon', 'update:',
    ].some(kw => lowerText.includes(kw));
    
    return hasPromptKeyword && !isNews;
}

// Extract tags from tweet text
function extractTags(text: string): string[] {
    const tags: string[] = ['twitter'];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('nano banana')) tags.push('nano-banana');
    if (lowerText.includes('image') || lowerText.includes('photo')) tags.push('image-generation');
    if (lowerText.includes('portrait')) tags.push('portrait');
    if (lowerText.includes('style')) tags.push('style');
    if (lowerText.includes('code') || lowerText.includes('coding')) tags.push('coding');
    
    return tags;
}

// Convert FxTweet to our schema
function convertToPrompt(tweet: FxTweet['tweet']): ScrapedPrompt {
    const tags = extractTags(tweet.text);
    
    return {
        id: `twitter-${tweet.id}`,
        title: `${tweet.author.name}: ${tweet.text.substring(0, 50)}...`,
        description: tweet.text.substring(0, 200),
        promptText: tweet.text,
        tags: tags,
        author: {
            name: `@${tweet.author.screen_name}`,
            url: `https://x.com/${tweet.author.screen_name}`,
            platform: 'Twitter',
        },
        originalSourceUrl: tweet.url,
        stats: {
            likes: tweet.likes,
            views: tweet.views || 0,
            retweets: tweet.retweets,
        },
        createdAt: new Date(tweet.created_timestamp * 1000).toISOString(),
        source: 'x-fxtwitter',
    };
}

// Load known tweet IDs from a seed file or existing data
async function loadKnownTweetIds(): Promise<string[]> {
    const seedFile = path.join(DATA_DIR, 'x-seed-urls.txt');
    const tweetIds: string[] = [];
    
    // Try to load from seed file
    try {
        const content = await fs.readFile(seedFile, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
            // Extract tweet ID from URL or raw ID
            const match = line.match(/status\/(\d+)/);
            if (match) {
                tweetIds.push(match[1]);
            } else if (/^\d+$/.test(line.trim())) {
                tweetIds.push(line.trim());
            }
        }
        console.log(`📄 Loaded ${tweetIds.length} tweet IDs from seed file`);
    } catch {
        console.log(`📄 No seed file found at ${seedFile}`);
        console.log(`   Create this file with one tweet URL per line to scrape specific tweets.`);
    }
    
    return tweetIds;
}

async function main() {
    console.log('🐦 Starting X/Twitter Scraper (FxTwitter API Mode)...\n');
    
    // Load existing data
    let existingData: ScrapedPrompt[] = [];
    try {
        const content = await fs.readFile(OUTPUT_FILE, 'utf-8');
        existingData = JSON.parse(content);
        console.log(`📦 Loaded ${existingData.length} existing tweets`);
    } catch {
        console.log('📦 No existing data, starting fresh');
    }
    
    const existingIds = new Set(existingData.map(d => d.id));
    const newPrompts: ScrapedPrompt[] = [];
    
    // Load known tweet IDs
    const tweetIds = await loadKnownTweetIds();
    
    if (tweetIds.length === 0) {
        console.log('\n⚠️ No tweet IDs to scrape.');
        console.log('   To add tweets, create data/x-seed-urls.txt with one URL per line.');
        console.log('   Example:');
        console.log('     https://x.com/NanoBanana/status/1997971257044709417');
        console.log('     https://twitter.com/GeminiApp/status/1234567890');
        return;
    }
    
    // Fetch each tweet
    console.log(`\n🔍 Fetching ${tweetIds.length} tweets...\n`);
    
    for (const tweetId of tweetIds) {
        const existingId = `twitter-${tweetId}`;
        if (existingIds.has(existingId)) {
            console.log(`   ⏭️ Skip (already exists): ${tweetId}`);
            continue;
        }
        
        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
        
        const result = await fetchTweet(tweetId);
        if (!result || result.code !== 200) {
            continue;
        }
        
        const tweet = result.tweet;
        
        // Check if it's a prompt
        if (!isPromptTweet(tweet.text)) {
            console.log(`   ❌ Not a prompt: "${tweet.text.substring(0, 50)}..."`);
            continue;
        }
        
        const prompt = convertToPrompt(tweet);
        newPrompts.push(prompt);
        console.log(`   ✅ Found: "${prompt.title.substring(0, 60)}..."`);
    }
    
    // Merge and save
    const allPrompts = [...existingData, ...newPrompts];
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(allPrompts, null, 2));
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Existing: ${existingData.length}`);
    console.log(`   - New: ${newPrompts.length}`);
    console.log(`   - Total: ${allPrompts.length}`);
    console.log(`\n💾 Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
