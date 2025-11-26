import { graphql } from "@octokit/graphql";
import { GeminiPrompt } from '../../schema/prompt';

interface SearchQueryResponse {
  search: {
    edges: Array<{
      node: {
        repository: {
          name: string;
          owner: { login: string };
          url: string;
          object?: {
            text: string;
          };
        };
      };
    }>;
  };
}

export async function scrapeGithub(): Promise<GeminiPrompt[]> {
  console.log('🐙 Starting GitHub Scraper...');
  
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠️ No GITHUB_TOKEN found. Skipping GitHub scraping.');
    return [];
  }

  const prompts: GeminiPrompt[] = [];

  try {
    // Query to find repositories with "gemini" topic and get prompts.json if it exists
    // This is a simplified query for demonstration
    const query = `
      query($queryString: String!) {
        search(query: $queryString, type: REPOSITORY, first: 10) {
          edges {
            node {
              ... on Repository {
                name
                owner { login }
                url
                object(expression: "HEAD:prompts.json") {
                  ... on Blob {
                    text
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await graphql<SearchQueryResponse>(query, {
      queryString: "topic:gemini-prompt sort:stars-desc",
      headers: {
        authorization: `token ${token}`,
      },
    });

    response.search.edges.forEach(edge => {
      const repo = edge.node.repository;
      if (repo.object?.text) {
        try {
          const repoPrompts = JSON.parse(repo.object.text);
          if (Array.isArray(repoPrompts)) {
             console.log(`   Found ${repoPrompts.length} prompts in ${repo.owner.login}/${repo.name}`);
             
             repoPrompts.forEach((p: any) => {
                // Basic mapping to ensure compatibility
                const prompt: GeminiPrompt = {
                  id: crypto.randomUUID(), // Generate new ID for local storage
                  title: p.title || "Untitled Prompt",
                  promptText: p.promptText || p.prompt || "",
                  systemInstruction: p.systemInstruction,
                  tags: Array.isArray(p.tags) ? p.tags : [],
                  sourcePlatform: "github",
                  originUrl: p.originUrl || repo.url,
                  author: p.author || repo.owner.login,
                  modelTarget: p.modelTarget,
                  modality: Array.isArray(p.modality) ? p.modality : ["text"],
                  fetchedAt: new Date().toISOString(),
                  metaMetrics: {
                    stars: p.metaMetrics?.stars || 0,
                    forks: p.metaMetrics?.forks || 0,
                  }
                };
                
                // Only add if it has the minimum required fields
                if (prompt.promptText && prompt.promptText.length >= 10) {
                  prompts.push(prompt);
                }
             });
          }
        } catch (e) {
          console.warn(`   Failed to parse prompts.json from ${repo.owner.login}/${repo.name}`);
        }
      }
    });

  } catch (error) {
    console.error('❌ GitHub scraping failed:', error);
  }

  return prompts;
}
