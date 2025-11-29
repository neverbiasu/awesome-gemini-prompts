import Parser from 'rss-parser';

// Initialize RSS Parser
const parser = new Parser({
  headers: {
    'User-Agent': 'GeminiPromptScraper/1.0 (RSS)'
  }
});

const SUBREDDITS = ['GoogleGeminiAI', 'Bard', 'PromptEngineering', 'ChatGPT'];
const FLAIRS = ['Prompt', 'Share', 'Resource', 'Guide', 'Educational', 'Tip'];

export async function scrapeReddit(): Promise<any[]> {
  console.log('🤖 Starting Reddit Scraper (RSS Search Mode)...');
  
  const rawPosts: any[] = [];
  const seenUrls = new Set<string>();

  for (const subName of SUBREDDITS) {
    for (const flair of FLAIRS) {
      try {
        // Search for specific flairs via RSS
        // URL encoding is critical here
        const encodedFlair = encodeURIComponent(`flair:"${flair}"`);
        const feedUrl = `https://www.reddit.com/r/${subName}/search.rss?q=${encodedFlair}&restrict_sr=1&sort=top&t=all&limit=50`;
        
        console.log(`   Fetching RSS feed for r/${subName} [${flair}]...`);
        
        const feed = await parser.parseURL(feedUrl);
        console.log(`   Found ${feed.items.length} entries in r/${subName} [${flair}].`);

        for (const item of feed.items) {
          // Filter low quality or irrelevant items based on title/content length
          if (!item.title || !item.link) continue;
          
          // Dedup across flairs/subreddits
          if (seenUrls.has(item.link)) continue;
          seenUrls.add(item.link);

          try {
            // Construct JSON URL (append .json to the post link)
            const jsonUrl = item.link.endsWith('/') ? `${item.link}.json` : `${item.link}/.json`;
            
            // Add a small delay to respect rate limits (1s)
            await new Promise(resolve => setTimeout(resolve, 1000));

            const response = await fetch(jsonUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });

            if (!response.ok) {
              console.warn(`      ⚠️ Failed to fetch JSON for ${item.title}: ${response.status}`);
              continue;
            }

            const data = await response.json();
            const postData = data[0]?.data?.children?.[0]?.data;

            if (!postData) {
               continue;
            }
            
            // Quality Check: Must have selftext (body) and reasonable length
            if (!postData.selftext || postData.selftext.length < 50) {
                continue;
            }

            console.log(`      Found: ${postData.title.substring(0, 50)}...`);

            rawPosts.push({
              source: 'reddit',
              subreddit: subName,
              flair: flair,
              title: postData.title,
              content: postData.selftext, 
              url: postData.url || item.link,
              author: postData.author,
              date: new Date(postData.created_utc * 1000).toISOString(),
              stats: {
                upvotes: postData.ups,
                comments: postData.num_comments
              }
            });

          } catch (err: any) {
            console.error(`      ❌ Error processing item ${item.title}:`, err.message);
          }
        }

      } catch (error: any) {
        // Some subreddits might not have the flair, just ignore
        // console.error(`❌ Failed to scrape r/${subName} [${flair}]:`, error.message);
      }
    }
  }

  return rawPosts;
}
