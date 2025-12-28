/**
 * X/Twitter Auto-Discovery Scraper
 * 
 * Uses Google Custom Search API to discover tweet URLs,
 * then FxTwitter API to fetch tweet details.
 * 
 * Environment Variables Required:
 *   GOOGLE_CUSTOM_SEARCH_API_KEY - Google API Key
 *   GOOGLE_CUSTOM_SEARCH_CX - Programmable Search Engine ID
 * 
 * Usage:
 *   bun src/scripts/scraper/x-auto-discover.ts
 */

import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'x.json');
const SEED_FILE = path.join(DATA_DIR, 'x-seed-urls.txt');

// Search queries to find Gemini prompts on Twitter
const SEARCH_QUERIES = [
    'site:twitter.com OR site:x.com "gemini prompt"',
    'site:twitter.com OR site:x.com "nano banana" prompt',
    'site:twitter.com OR site:x.com "system instruction" gemini',
    'site:twitter.com OR site:x.com gemini "try this prompt"',
    'site:twitter.com OR site:x.com gemini image generation prompt',
];

interface GoogleSearchResult {
    items?: Array<{
        title: string;
        link: string;
        snippet: string;
    }>;
    searchInformation?: {
        totalResults: string;
    };
}

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

// Google Custom Search
async function searchGoogle(query: string, apiKey: string, cx: string): Promise<string[]> {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', apiKey);
    url.searchParams.set('cx', cx);
    url.searchParams.set('q', query);
    url.searchParams.set('num', '10'); // Max 10 results per query
    
    try {
        const response = await fetch(url.toString());
        if (!response.ok) {
            console.error(`   ❌ Google Search failed: ${response.status}`);
            const text = await response.text();
            console.error(`   ${text.substring(0, 200)}`);
            return [];
        }
        
        const data: GoogleSearchResult = await response.json();
        const tweetUrls: string[] = [];
        
        if (data.items) {
            for (const item of data.items) {
                // Extract tweet URLs
                const match = item.link.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/);
                if (match) {
                    tweetUrls.push(item.link);
                }
            }
        }
        
        console.log(`   Found ${tweetUrls.length} tweet URLs`);
        return tweetUrls;
        
    } catch (error) {
        console.error(`   ❌ Network error:`, error);
        return [];
    }
}

// Extract tweet ID from URL
function extractTweetId(url: string): string | null {
    const match = url.match(/status\/(\d+)/);
    return match ? match[1] : null;
}

// Fetch tweet via FxTwitter
async function fetchTweet(tweetId: string): Promise<FxTweet | null> {
    try {
        const response = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
        if (!response.ok) {
            return null;
        }
        return await response.json() as FxTweet;
    } catch {
        return null;
    }
}

// Check if tweet is a prompt
function isPromptTweet(text: string): boolean {
    const lowerText = text.toLowerCase();
    
    const hasPromptKeyword = [
        'prompt:', 'prompt -', 'here\'s a prompt', 'here is a prompt',
        'try this prompt', 'system instruction', 'gemini prompt',
        'nano banana', '[reference image]', 'image{', '"scene":', '"subject":',
        'generate an image', 'create an image',
    ].some(kw => lowerText.includes(kw));
    
    const isNews = [
        'announcing', 'we\'re excited', 'introducing', 'now available',
        'coming soon', 'update:', 'breaking:', 'just launched',
    ].some(kw => lowerText.includes(kw));
    
    return hasPromptKeyword && !isNews && text.length > 50;
}

// Extract tags
function extractTags(text: string): string[] {
    const tags: string[] = ['twitter'];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('nano banana')) tags.push('nano-banana');
    if (lowerText.includes('image') || lowerText.includes('photo')) tags.push('image-generation');
    if (lowerText.includes('portrait')) tags.push('portrait');
    if (lowerText.includes('style')) tags.push('style');
    if (lowerText.includes('code') || lowerText.includes('coding')) tags.push('coding');
    if (lowerText.includes('system instruction')) tags.push('system-instruction');
    
    return tags;
}

// Convert to prompt schema
function convertToPrompt(tweet: FxTweet['tweet']): ScrapedPrompt {
    return {
        id: `twitter-${tweet.id}`,
        title: `${tweet.author.name}: ${tweet.text.substring(0, 50)}...`,
        description: tweet.text.substring(0, 200),
        promptText: tweet.text,
        tags: extractTags(tweet.text),
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
        source: 'x-auto-discover',
    };
}

// Save discovered URLs to seed file for future runs
async function appendToSeedFile(urls: string[]) {
    if (urls.length === 0) return;
    
    let existing = '';
    try {
        existing = await fs.readFile(SEED_FILE, 'utf-8');
    } catch {}
    
    const existingUrls = new Set(existing.split('\n').filter(l => l.trim()));
    const newUrls = urls.filter(u => !existingUrls.has(u));
    
    if (newUrls.length > 0) {
        await fs.appendFile(SEED_FILE, '\n# Auto-discovered ' + new Date().toISOString() + '\n' + newUrls.join('\n') + '\n');
        console.log(`📝 Added ${newUrls.length} URLs to seed file`);
    }
}

async function main() {
    console.log('🔍 Starting X/Twitter Auto-Discovery Scraper...\n');
    
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
    
    if (!apiKey || !cx) {
        console.error('❌ Missing environment variables:');
        if (!apiKey) console.error('   - GOOGLE_CUSTOM_SEARCH_API_KEY');
        if (!cx) console.error('   - GOOGLE_CUSTOM_SEARCH_CX');
        process.exit(1);
    }
    
    // Load existing data
    let existingData: ScrapedPrompt[] = [];
    try {
        const content = await fs.readFile(OUTPUT_FILE, 'utf-8');
        existingData = JSON.parse(content);
        console.log(`📦 Loaded ${existingData.length} existing tweets`);
    } catch {
        console.log('📦 No existing data');
    }
    
    const existingIds = new Set(existingData.map(d => d.id));
    const discoveredUrls: string[] = [];
    const newPrompts: ScrapedPrompt[] = [];
    
    // Search for tweets
    console.log(`\n🔎 Searching with ${SEARCH_QUERIES.length} queries...\n`);
    
    for (const query of SEARCH_QUERIES) {
        console.log(`📡 Query: "${query.substring(0, 50)}..."`);
        
        const urls = await searchGoogle(query, apiKey, cx);
        discoveredUrls.push(...urls);
        
        // Rate limit: 1 second between queries
        await new Promise(r => setTimeout(r, 1000));
    }
    
    // Dedupe URLs
    const uniqueUrls = [...new Set(discoveredUrls)];
    console.log(`\n📊 Discovered ${uniqueUrls.length} unique tweet URLs`);
    
    // Fetch each tweet
    console.log(`\n🐦 Fetching tweet details...\n`);
    
    let fetchedCount = 0;
    let skippedCount = 0;
    let rejectedCount = 0;
    
    for (const url of uniqueUrls) {
        const tweetId = extractTweetId(url);
        if (!tweetId) continue;
        
        const existingId = `twitter-${tweetId}`;
        if (existingIds.has(existingId)) {
            skippedCount++;
            continue;
        }
        
        // Rate limit
        await new Promise(r => setTimeout(r, 300));
        
        const result = await fetchTweet(tweetId);
        if (!result || result.code !== 200) {
            continue;
        }
        
        fetchedCount++;
        const tweet = result.tweet;
        
        if (!isPromptTweet(tweet.text)) {
            rejectedCount++;
            console.log(`   ❌ Not a prompt: "${tweet.text.substring(0, 40)}..."`);
            continue;
        }
        
        const prompt = convertToPrompt(tweet);
        newPrompts.push(prompt);
        existingIds.add(existingId);
        console.log(`   ✅ Found: "${prompt.title.substring(0, 50)}..."`);
    }
    
    // Save results
    const allPrompts = [...existingData, ...newPrompts];
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(allPrompts, null, 2));
    
    // Also save discovered URLs to seed file
    await appendToSeedFile(uniqueUrls);
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Queries: ${SEARCH_QUERIES.length}`);
    console.log(`   - URLs discovered: ${uniqueUrls.length}`);
    console.log(`   - Already exists: ${skippedCount}`);
    console.log(`   - Fetched: ${fetchedCount}`);
    console.log(`   - Rejected (not prompt): ${rejectedCount}`);
    console.log(`   - New prompts: ${newPrompts.length}`);
    console.log(`   - Total in DB: ${allPrompts.length}`);
    console.log(`\n💾 Saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
