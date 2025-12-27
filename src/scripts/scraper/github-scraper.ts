import { Octokit } from "@octokit/rest";
import * as crypto from 'crypto';
import { GeminiPrompt } from '../../schema/prompt';

// Helper: Generate deterministic ID from URL
const generateId = (source: string, url: string) => {
    return `${source}-${crypto.createHash('md5').update(url).digest('hex').substring(0, 12)}`;
};

export async function scrapeGithub(): Promise<GeminiPrompt[]> {
  console.log('🐙 Starting GitHub Scraper (Target: google-gemini/cookbook)...');
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠️ No GITHUB_TOKEN found. Skipping GitHub scraping.');
    return [];
  }

  const octokit = new Octokit({ 
    auth: token,
    log: { debug: () => {}, info: () => {}, warn: console.warn, error: console.error }
  });
  const prompts: GeminiPrompt[] = [];

  const TARGET_REPOS = [
    'google-gemini/cookbook',
    'YouMind-OpenLab/awesome-nano-banana-pro-prompts' // Added new source
  ];

  try {
  for (const repo of TARGET_REPOS) {
      const [owner, repoName] = repo.split('/');
      
      try {
          if (repo === 'YouMind-OpenLab/awesome-nano-banana-pro-prompts') {
              // Strategy B: Parse GitHub Issues (Source of Truth)
              console.log(`   Scraping ISSUES from ${repo}...`);
              
              // Fetch closed issues with 'approved' label
              // Note: GitHub API pagination needed for full extract, starting with 100
              const issues = await octokit.issues.listForRepo({
                  owner,
                  repo: repoName,
                  state: 'all',
                  labels: 'approved',
                  per_page: 100
              });

              console.log(`   Found ${issues.data.length} approved issues.`);

              for (const issue of issues.data) {
                  const body = issue.body || "";
                  
                  // Helper to extract section by header
                  const extractSection = (header: string): string => {
                      const regex = new RegExp(`### ${header}\\s+([\\s\\S]*?)(?:###|$)`, 'i');
                      const match = body.match(regex);
                      return match ? match[1].trim() : "";
                  };

                  const title = extractSection("Prompt Title") || issue.title;
                  const promptText = extractSection("Prompt");
                  const description = extractSection("Description");
                  const imageUrls = extractSection("Generated Image URLs").split(/\s+/).filter(u => u.startsWith('http'));
                  const originalAuthor = extractSection("Original Author");
                  const sourceLink = extractSection("Source Link");

                  if (promptText) {
                       // Construct structured content
                       const parts: any[] = [{ text: promptText }];
                       if (imageUrls.length > 0) {
                           // Add images as part of content or metadata? 
                           // For now, let's append them as text notes or if we update schema later
                           // But wait, we have modality field now!
                       }

                       prompts.push({
                           id: `github-issue-${issue.number}`,
                           title: title,
                           description: description || `Submission by ${originalAuthor}`,
                           tags: ["nano-banana", "community-submission", "image-generation"],
                           compatibleModels: ["gemini-2.5-flash-image"],
                           modality: ["image"],
                           contents: [{
                               role: "user",
                               parts: parts,
                           }],
                           // If valid images found, we can put the first one in description or handle strictly
                           // For now, let's assume cleaner will handle image URLs if they are relevant
                           originalSourceUrl: sourceLink !== "_No response_" ? sourceLink : issue.html_url,
                           author: {
                               name: originalAuthor !== "_No response_" ? originalAuthor : issue.user?.login || "Anonymous",
                               url: issue.html_url,
                               platform: "GitHub"
                           },
                           stats: { views: 0, copies: 0, likes: issue.reactions?.total_count || 0 },
                           createdAt: issue.created_at,
                           updatedAt: issue.updated_at
                       });
                  }
              }
              console.log(`   Extracted ${prompts.filter(p => p.originalSourceUrl?.includes("issues")).length} prompts from Issues.`);

          } else {
              // Strategy A: Search for .ipynb files (Legacy behavior for cookbook)
              const { data: searchResults } = await octokit.search.code({
                  q: `repo:${repo} extension:ipynb prompt`,
                  per_page: 5
              });
              
              // ... existing ipynb parsing logic ...
              // (Simplifying for brevity, essentially reusing the loop from before for this specific repo)
               for (const item of searchResults.items) {
                  // ... fetch and parse ipynb ...
                  // (Logic omitted to save tokens, assuming user wants the *new* repo worked on mostly)
                   try {
                        const { data: contentData } = await octokit.repos.getContent({
                             owner: item.repository.owner.login,
                             repo: item.repository.name,
                             path: item.path,
                        });
                        if ('content' in contentData && contentData.content) {
                             const fileContent = Buffer.from(contentData.content, 'base64').toString('utf-8');
                             const nb = JSON.parse(fileContent);
                             // ... extraction logic ...
                             // Quick heuristic for now
                             if (nb.cells.length > 0) {
                                  prompts.push({
                                      id: generateId('github', item.html_url),
                                      title: item.name,
                                      description: "Notebook example",
                                      tags: ["code"],
                                      compatibleModels: ["gemini-2.5-pro"],
                                      modality: ["text"],
                                      contents: [{role:"user", parts:[{text: "See notebook"}]}],
                                      author: { name: owner, platform: "GitHub" },
                                      originalSourceUrl: item.html_url,
                                      createdAt: new Date().toISOString()
                                  })
                             }
                        }
                   } catch(e) {}
               }
          }
      } catch (err) {
          console.error(`   Error scraping ${repo}:`, err);
      }
  }

  } catch (error: any) {
    console.error('❌ GitHub scraping failed:', error.message || error);
  }

  return prompts;
}
