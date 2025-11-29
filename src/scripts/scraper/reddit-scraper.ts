import Snoowrap from 'snoowrap';
import { GeminiPrompt } from '../../schema/prompt';

// Subreddit-specific configuration
const SUBREDDIT_CONFIG: Record<string, { whitelist: string[], blacklist: string[] }> = {
  'GeminiAI': {
    whitelist: [
      'Ressource', 
      'Generated Images (with prompt)', 
      'Generated Videos (with prompt) FLOW / VEO 3', 
      'GEMs (Custom Gemini Expert)', 
      'Ideas (enhanced/written with AI)', 
      'NotebookLM'
    ],
    blacklist: [
      'Discussion', 'Help/question', 'News', 'Other', 'Self promo', 
      'Funny (Highlight/meme)', 'Interesting response (Highlight)', 
      'Gemini CLI', 'NanoBanana'
    ]
  },
  'Bard': {
    whitelist: ['Prompt', 'Share', 'Resource', 'Creative'],
    blacklist: ['Question', 'Help', 'Bug', 'Issue', 'News', 'Discussion']
  },
  'GoogleBard': {
    whitelist: ['Prompt', 'Share', 'Resource', 'Creative'],
    blacklist: ['Question', 'Help', 'Bug', 'Issue', 'News', 'Discussion']
  }
};

export async function scrapeReddit(): Promise<Partial<GeminiPrompt>[]> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (clientId && clientSecret && username && password) {
    console.log("👽 Starting Reddit Scraper (Authenticated via Snoowrap)...");
    try {
      const results = await scrapeRedditAuthenticated(clientId, clientSecret, username, password);
      if (results.length > 0) {
        return results;
      }
      console.warn("⚠️ Reddit Auth returned 0 results (possible Auth error). Falling back to No-Auth mode.");
      return scrapeRedditNoAuth();
    } catch (e) {
      console.warn("⚠️ Reddit Auth failed (check credentials). Falling back to No-Auth mode.");
      return scrapeRedditNoAuth();
    }
  } else {
    console.log("👽 Starting Reddit Scraper (No-Auth Fallback)...");
    console.log("   (Tip: Add REDDIT_CLIENT_ID etc. to .env for better stability)");
    return scrapeRedditNoAuth();
  }
}

async function scrapeRedditAuthenticated(clientId: string, clientSecret: string, username: string, password: string): Promise<Partial<GeminiPrompt>[]> {
  const userAgent = process.env.REDDIT_USER_AGENT || 'GeminiPromptScraper/1.0';
  
  const r = new Snoowrap({
    userAgent,
    clientId,
    clientSecret,
    username,
    password
  });

  const subreddits = ['Bard', 'GeminiAI', 'GoogleBard'];
  const candidates: Partial<GeminiPrompt>[] = [];

  for (const sub of subreddits) {
    try {
      console.log(`   Scraping r/${sub}...`);
      const posts = await r.getSubreddit(sub).getHot({ limit: 25 });
      const config = SUBREDDIT_CONFIG[sub] || { whitelist: [], blacklist: [] };

      for (const post of posts) {
        if (shouldSkipPost(post, config)) continue;

        candidates.push({
          title: post.title,
          promptText: post.selftext || post.title,
          sourcePlatform: "reddit",
          originUrl: `https://www.reddit.com${post.permalink}`,
          tags: [sub, post.link_flair_text].filter(Boolean) as string[],
          author: {
            name: post.author.name,
            profileUrl: `https://www.reddit.com/user/${post.author.name}`
          },
          metaMetrics: {
            upvotes: post.ups,
            commentCount: post.num_comments
          }
        });
      }
    } catch (error: any) {
      console.error(`   Error scraping r/${sub} (Auth):`, error.message || error);
    }
  }
  
  console.log(`   Found ${candidates.length} prompts from Reddit (Auth).`);
  return candidates;
}

async function scrapeRedditNoAuth(): Promise<Partial<GeminiPrompt>[]> {
  const subreddits = ['Bard', 'GeminiAI', 'GoogleBard'];
  const candidates: Partial<GeminiPrompt>[] = [];

  for (const sub of subreddits) {
    try {
      console.log(`   Scraping r/${sub}...`);
      const response = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        console.warn(`   Failed to fetch r/${sub}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const posts = data.data.children;
      const config = SUBREDDIT_CONFIG[sub] || { whitelist: [], blacklist: [] };

      for (const postWrapper of posts) {
        const post = postWrapper.data;
        if (shouldSkipPost(post, config)) continue;

        candidates.push({
          title: post.title,
          promptText: post.selftext || post.title,
          sourcePlatform: "reddit",
          originUrl: `https://www.reddit.com${post.permalink}`,
          tags: [sub, post.link_flair_text].filter(Boolean) as string[],
          author: {
            name: post.author,
            profileUrl: `https://www.reddit.com/user/${post.author}`
          },
          metaMetrics: {
            upvotes: post.ups,
            commentCount: post.num_comments
          }
        });
      }
    } catch (error: any) {
      console.error(`   Error scraping r/${sub} (No-Auth):`, error.message || error);
    }
  }

  console.log(`   Found ${candidates.length} prompts from Reddit (No-Auth).`);
  return candidates;
}

// Shared filtering logic
function shouldSkipPost(post: any, config: { whitelist: string[], blacklist: string[] }): boolean {
    // 1. Metric Filtering
    if (post.ups < 3) return true;

    // 2. Content Filtering
    if (post.title.match(/^(How to|Why|Is there|Help)/i)) return true;

    // 3. Flair Filtering
    const flair = post.link_flair_text;
    
    if (config.whitelist.length > 0) {
        if (flair && config.blacklist.some(b => flair.includes(b))) return true;
        if (!flair || !config.whitelist.some(w => flair.includes(w))) return true;
    } else {
        if (flair && ['Question', 'Help', 'Bug', 'Issue', 'News'].some(k => flair.includes(k))) return true;
    }
    
    return false;
}
