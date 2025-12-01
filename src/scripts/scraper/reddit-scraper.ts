import Parser from 'rss-parser';

// Initialize RSS Parser
const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'GeminiPromptScraper/1.0 (RSS)'
  }
});

const SUBREDDITS = ['GoogleGeminiAI', 'GeminiAI', 'GoogleGemini', 'Bard', 'ChatGPT_Gemini', 'PromptEngineering', 'nanobanana', 'GeminiNanoBanana2'];
const FLAIRS = ['Prompt', 'Share', 'Resource', 'Guide', 'Educational', 'Tip'];
const KEYWORDS = ['prompt', 'system instruction', 'act as a', 'you are a'];

export async function scrapeReddit(): Promise<any[]> {
  console.log('🤖 Starting Reddit Scraper (Multi-Dimension Search Mode)...');
  
  const rawPosts: any[] = [];
  const seenUrls = new Set<string>();

  // Helper to build RSS URLs
  const buildUrl = (sub: string, query: string, sort: string, time: string = 'all') => {
      const encodedQuery = encodeURIComponent(query);
      return `https://www.reddit.com/r/${sub}/search.rss?q=${encodedQuery}&restrict_sr=1&sort=${sort}&t=${time}&limit=50`;
  };

  for (const subName of SUBREDDITS) {
    console.log(`\n🔎 Scanning r/${subName}...`);

    // 1. Search by Flair (High Precision)
    for (const flair of FLAIRS) {
        const query = `flair:"${flair}"`;
        
        // Strategy: Top (All Time), Top (Year), New, Hot
        const strategies = [
            { sort: 'top', time: 'all', label: 'Top-All' },
            { sort: 'top', time: 'year', label: 'Top-Year' },
            { sort: 'new', time: 'all', label: 'New' },
            { sort: 'hot', time: 'all', label: 'Hot' }
        ];

        for (const strat of strategies) {
            try {
                const feedUrl = buildUrl(subName, query, strat.sort, strat.time);
                await processFeed(feedUrl, subName, `${flair} [${strat.label}]`);
            } catch (e) { /* ignore */ }
        }
    }

    // 2. Search by Keyword (Broad Discovery)
    for (const keyword of KEYWORDS) {
        // Strategy: Top (All Time) only for keywords to avoid noise
        try {
            const feedUrl = buildUrl(subName, keyword, 'top', 'all');
            await processFeed(feedUrl, subName, `Keyword: "${keyword}"`);
        } catch (e) { /* ignore */ }
    }
  }

  return rawPosts;

  async function processFeed(feedUrl: string, subName: string, sourceLabel: string) {
    try {
        console.log(`   Fetching RSS: r/${subName} - ${sourceLabel}`);
        
        const feed = await parser.parseURL(feedUrl);
        if (feed.items.length > 0) {
            console.log(`   Found ${feed.items.length} entries in r/${subName} [${sourceLabel}]`);
        }

        for (const item of feed.items) {
          if (!item.title || !item.link) continue;
          
          // Dedup
          if (seenUrls.has(item.link)) continue;
          seenUrls.add(item.link);

          try {
            const jsonUrl = item.link.endsWith('/') ? `${item.link}.json` : `${item.link}/.json`;
            await new Promise(resolve => setTimeout(resolve, 200)); // Reduced delay for speed

            const response = await fetch(jsonUrl, {
              signal: AbortSignal.timeout(5000),
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });

            if (!response.ok) continue;

            const data = await response.json();
            const postData = data[0]?.data?.children?.[0]?.data;

            if (!postData) continue;
            
            // Quality Check: Must have selftext (body)
            // REMOVED 50-char limit as requested
            if (!postData.selftext) continue;

            // console.log(`      + [${postData.ups} ups] ${postData.title.substring(0, 60)}...`);

            rawPosts.push({
              source: 'reddit',
              subreddit: subName,
              flair: sourceLabel,
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
             // Silent fail for individual items
          }
        }
    } catch (error: any) {
        // Silent fail for feeds
    }
  }
}
