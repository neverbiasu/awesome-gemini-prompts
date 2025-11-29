import { Octokit } from "@octokit/rest";
import { GeminiPrompt } from '../../schema/prompt';

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

  try {
    // 1. Get contents of the 'examples' directory (or root if examples doesn't exist)
    // For google-gemini/cookbook, there are many folders. Let's look at 'quickstarts' or 'examples'.
    // Let's try to list the root first to see structure, but for MVP let's assume we want to find .ipynb files.
    // We can use the Search API restricted to this repo to find .ipynb files directly!
    
    const { data: searchResults } = await octokit.search.code({
      q: 'repo:google-gemini/cookbook extension:ipynb prompt',
      per_page: 10 // Start small
    });

    console.log(`   Found ${searchResults.total_count} notebooks with 'prompt'.`);

    for (const item of searchResults.items) {
      try {
        // 2. Get file content
        const { data: contentData } = await octokit.repos.getContent({
          owner: item.repository.owner.login,
          repo: item.repository.name,
          path: item.path,
        });

        if ('content' in contentData && contentData.content) {
          const fileContent = Buffer.from(contentData.content, 'base64').toString('utf-8');
          
          // 3. Parse Notebook
          // Notebooks are JSON. We look for cells with "prompt =" or similar.
          try {
             const nb = JSON.parse(fileContent);
             let extractedPrompt = "";
             
             // Simple heuristic: Find the first code cell that defines a variable named 'prompt'
             // or a markdown cell that contains "Prompt:"
             for (const cell of nb.cells) {
                 if (cell.cell_type === 'code') {
                     const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
                     // Regex to find prompt = "..." or prompt = '...'
                     const match = source.match(/prompt\s*=\s*(["']{3}|["'])([\s\S]*?)\1/);
                     if (match && match[2].length > 20) {
                         extractedPrompt = match[2];
                         break; // Found one!
                     }
                 }
             }
             
             // Fallback: If no explicit prompt variable, use the file description or first markdown cell
             if (!extractedPrompt && nb.cells.length > 0 && nb.cells[0].cell_type === 'markdown') {
                 const firstCell = Array.isArray(nb.cells[0].source) ? nb.cells[0].source.join('') : nb.cells[0].source;
                 extractedPrompt = firstCell.substring(0, 200) + "... (See Notebook)";
             }

             if (extractedPrompt) {
                 prompts.push({
                    id: crypto.randomUUID(),
                    title: item.name.replace('.ipynb', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    promptText: extractedPrompt,
                    description: `Official example from ${item.repository.full_name}`,
                    tags: ["official", "cookbook", "code"],
                    sourcePlatform: "github",
                    originUrl: item.html_url,
                    modelTarget: ["gemini-1.5-pro"],
                    inputModality: ["text"],
                    outputModality: ["code", "text"],
                    fetchedAt: new Date().toISOString(),
                    author: {
                      name: item.repository.owner.login,
                      profileUrl: item.repository.owner.html_url
                    },
                    confidenceScore: 0.9
                 });
             }

          } catch (e) {
              // Not a valid JSON notebook or parsing failed
          }
        }
      } catch (e: any) {
        console.warn(`      Failed to process ${item.path}: ${e.message}`);
      }
    }

  } catch (error: any) {
    console.error('❌ GitHub scraping failed:', error.message || error);
  }

  return prompts;
}
