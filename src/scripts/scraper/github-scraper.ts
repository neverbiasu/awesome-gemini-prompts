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
          // Basic validation/mapping could happen here
          if (Array.isArray(repoPrompts)) {
             // Map to our schema if needed, or assume compatibility
             // For now, we just log found repos
             console.log(`   Found prompts in ${repo.owner.login}/${repo.name}`);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

  } catch (error) {
    console.error('❌ GitHub scraping failed:', error);
  }

  return prompts;
}
