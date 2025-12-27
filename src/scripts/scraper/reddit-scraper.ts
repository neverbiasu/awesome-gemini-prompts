const SUBREDDITS = [
    'GoogleGeminiAI', 'GeminiAI', 'GoogleGemini', 'Bard', 'ChatGPT_Gemini', 'PromptEngineering', 'GeminiPrompts', // Text
    'GeminiNanoBanana2', 'StableDiffusion', 'GeminiNanoBanana', 'NanoBanana_AI', 'generativeAI', // Image
];

// Keywords for "Text Search" within subreddits
const KEYWORDS = ['prompt', 'system instruction', 'style', 'workflow', 'generation', 'nano banana'];

export async function scrapeReddit(): Promise<any[]> {
  console.log('🤖 Starting Reddit Scraper (Direct JSON API Mode)...');
  
  const rawPosts: any[] = [];
  const seenUrls = new Set<string>();

  // Fetch helper
  const fetchJson = async (url: string) => {
      try {
          // Add random delay to be respectful
          await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
          
          const response = await fetch(url, {
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
          });
          if (!response.ok) {
              console.warn(`   ⚠️ Fetch failed ${response.status}: ${url}`);
              return null;
          }
          return await response.json();
      } catch (e) {
          console.error(`   ❌ Network error: ${url}`);
          return null;
      }
  };

// Helper: Check if post is junk (discussion, question, news)
  const isJunkPost = (title: string, flair: string, content: string) => {
      const lowerTitle = title.toLowerCase();
      const lowerFlair = (flair || '').toLowerCase();
      const lowerContent = content.toLowerCase();

      // 1. Explicit Junk Flairs
      if (['question', 'help', 'discussion', 'news', 'bug', 'issue', 'request'].some(f => lowerFlair.includes(f))) {
          // Exception: If it explicitly says "Prompt" or "Workflow", might be a share
          if (!lowerTitle.includes('prompt') && !lowerContent.includes('prompt') && !lowerContent.includes('workflow')) return true;
      }

      // 2. Question Titles (usually help requests)
      if (title.trim().endsWith('?')) return true;
      if (['how to', 'why does', 'anyone know', 'help me', 'is there'].some(q => lowerTitle.startsWith(q))) return true;

      // 3. News/Opinion specific keywords (unless it's a prompt share)
      if (['thoughts?', 'opinion?', 'vs', 'comparison', 'review', 'update:', 'release'].some(k => lowerTitle.includes(k))) {
           if (!lowerTitle.includes('prompt')) return true;
      }

      return false;
  };

  // Processing helper
  const processPost = (post: any, subName: string, sourceLabel: string) => {
      if (seenUrls.has(post.url)) return;
      
      // Extraction Check
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(post.url) || 
                      post.domain.includes('i.redd.it') || 
                      post.domain.includes('imgur.com');
      
      // Gallery Logic (Available in listing JSON!)
      const imageUrls: string[] = [];
      if (isImage) {
           imageUrls.push(post.url);
      }
      if (post.media_metadata) {
           const mediaIds = post.gallery_data?.items?.map((i: any) => i.media_id) || Object.keys(post.media_metadata);
           for (const mid of mediaIds) {
               const mediaItem = post.media_metadata[mid];
               if (mediaItem?.s?.u) {
                   const cleanUrl = mediaItem.s.u.replace(/&amp;/g, '&');
                   if (!imageUrls.includes(cleanUrl)) imageUrls.push(cleanUrl);
               }
           }
      }

      const hasContent = post.selftext && post.selftext.length > 0;
      const isGallery = imageUrls.length > 1;

      // Filter 1: Must have body OR be an image/gallery
      if (!hasContent && imageUrls.length === 0) return;

      // Filter 2: Strict Junk Check
      if (isJunkPost(post.title, post.link_flair_text, post.selftext || '')) {
          // Console log for debugging (optional, can be verbose)
          // console.log(`   🗑️ Ignored Junk: ${post.title.substring(0, 40)}...`);
          return;
      }

      if (imageUrls.length > 0) {
          console.log(`   📸 [${subName}] Found Image/Gallery (${imageUrls.length} imgs): ${post.title.substring(0, 40)}...`);
      } else {
          // If text only, ensure it's not too short (unless it has "prompt" keyword)
          if ((post.selftext || '').length < 50 && !post.title.toLowerCase().includes('prompt')) return;
      }

      seenUrls.add(post.url);
      rawPosts.push({
          source: 'reddit',
          subreddit: subName,
          flair: post.link_flair_text || sourceLabel,
          title: post.title,
          content: post.selftext || post.title,
          url: post.url,
          imageUrls: imageUrls,
          author: post.author,
          date: new Date(post.created_utc * 1000).toISOString(),
          stats: {
              upvotes: post.ups,
              comments: post.num_comments
          },
          modality: imageUrls.length > 0 ? ['image'] : ['text']
      });
  };

  // Main Loop
  for (const sub of SUBREDDITS) {
      console.log(`\n🔎 Scanning r/${sub}...`);
      
      // 1. Hot (Default Listing)
      const hotData = await fetchJson(`https://www.reddit.com/r/${sub}/hot.json?limit=25`);
      if (hotData?.data?.children) {
          hotData.data.children.forEach((child: any) => processPost(child.data, sub, 'Hot'));
      }

      // 2. Top Month (High Quality)
      const topData = await fetchJson(`https://www.reddit.com/r/${sub}/top.json?t=month&limit=25`);
      if (topData?.data?.children) {
          topData.data.children.forEach((child: any) => processPost(child.data, sub, 'Top-Month'));
      }

      // 3. Search (Specific Keywords) - Targeted High Value
      // We search for "System Instruction" specifically as it yields high quality structured prompts
      const searchUrl = `https://www.reddit.com/r/${sub}/search.json?q="system instruction"&restrict_sr=1&sort=relevance&t=all&limit=10`;
      try {
          const searchData = await fetchJson(searchUrl);
          if (searchData?.data?.children) {
              searchData.data.children.forEach((child: any) => processPost(child.data, sub, 'Search-SystemInstruction'));
          }
      } catch (e) {
          // Ignore search errors
      }
  }

  return rawPosts;
}
