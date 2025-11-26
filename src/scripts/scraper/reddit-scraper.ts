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

export async function scrapeReddit(): Promise<GeminiPrompt[]> {
  console.log('👽 Starting Reddit Scraper...');
  const prompts: GeminiPrompt[] = [];

  for (const sub of SUBREDDITS) {
    try {
      console.log(`   Scraping r/${sub}...`);
      // Use the public JSON endpoint
      const response = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.warn(`   Failed to fetch r/${sub}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const posts: RedditPost[] = data.data.children;

      for (const post of posts) {
        const { title, selftext, author, permalink, ups, link_flair_text } = post.data;

        // Simple heuristic: If it has "Prompt" flair or "prompt" in title, and substantial text
        const isPromptLikely = 
          (link_flair_text?.toLowerCase().includes('prompt') || title.toLowerCase().includes('prompt')) &&
          selftext.length > 50;

        if (isPromptLikely) {
           prompts.push({
             id: crypto.randomUUID(),
             title: title.length > 100 ? title.substring(0, 97) + '...' : title,
             promptText: selftext,
             tags: link_flair_text ? [link_flair_text.toLowerCase()] : ['reddit'],
             sourcePlatform: 'reddit',
             originUrl: `https://www.reddit.com${permalink}`,
             author: author,
             modality: ['text'], // Default to text
             fetchedAt: new Date().toISOString(),
             metaMetrics: {
               upvotes: ups
             }
           });
        }
      }

    } catch (error) {
      console.error(`   Error scraping r/${sub}:`, error);
    }
  }

  console.log(`   Found ${prompts.length} prompts from Reddit.`);
  return prompts;
}
