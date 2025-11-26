import { GeminiPrompt } from '../../schema/prompt';

const SUBREDDITS = ['Bard', 'GeminiAI', 'GoogleBard'];

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    author: string;
    url: string;
    permalink: string;
    ups: number;
    created_utc: number;
    link_flair_text?: string;
  };
}

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
  console.log("👽 Starting Reddit Scraper...");
  const subreddits = ['Bard', 'GeminiAI', 'GoogleBard'];
  const candidates: Partial<GeminiPrompt>[] = [];

  for (const sub of subreddits) {
    try {
      console.log(`   Scraping r/${sub}...`);
      const response = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`);
      
      if (!response.ok) {
        console.warn(`   Failed to fetch r/${sub}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const posts = data.data.children;

      const config = SUBREDDIT_CONFIG[sub] || { whitelist: [], blacklist: [] };

      for (const post of posts) {
        const p = post.data;
        
        // 1. Metric Filtering
        if (p.ups < 3) continue; // Skip low-quality posts

        // 2. Content Filtering (Basic)
        if (p.title.match(/^(How to|Why|Is there|Help)/i)) continue;

        // 3. Flair Filtering
        const flair = p.link_flair_text;
        
        // If subreddit has specific config
        if (config.whitelist.length > 0) {
           // If flair is explicitly blacklisted, skip
           if (flair && config.blacklist.some(b => flair.includes(b))) continue;
           
           // If flair is NOT in whitelist, skip (Strict mode)
           // Note: We also skip if flair is null/undefined in strict mode
           if (!flair || !config.whitelist.some(w => flair.includes(w))) {
             // Optional: Log what we skipped for debugging
             // console.log(`Skipped r/${sub} post "${p.title}" with flair: "${flair}"`);
             continue;
           }
        } else {
           // Fallback for unknown subreddits (Loose mode)
           if (flair && ['Question', 'Help', 'Bug', 'Issue', 'News'].some(k => flair.includes(k))) continue;
        }

        // 4. Extract
        candidates.push({
          title: p.title,
          promptText: p.selftext || p.title, // Initial capture, will be cleaned
          sourcePlatform: "reddit",
          originUrl: `https://www.reddit.com${p.permalink}`,
          tags: [sub, flair].filter(Boolean) as string[],
          author: p.author, // Schema expects string, not object
          metaMetrics: {
            upvotes: p.ups
            // commentCount is not in our schema yet
          }
        });
      }
    } catch (error) {
      console.error(`   Error scraping r/${sub}:`, error);
    }
  }

  console.log(`   Found ${candidates.length} prompts from Reddit.`);
  return candidates;
}
