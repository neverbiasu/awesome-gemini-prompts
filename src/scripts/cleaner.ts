import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { GeminiPrompt, GeminiPromptZodSchema, HarmCategory, HarmBlockThreshold } from '../schema/prompt';

// Define a schema for the cleaner's output that matches our new GeminiPrompt structure
// We use a subset of the full schema for the LLM to generate
const CleanedPromptOutputSchema = z.object({
  batchIndex: z.number().describe("The index of the raw candidate in the provided batch"),
  title: z.string(),
  description: z.string(),
  systemInstruction: z.string().optional().describe("The system instruction/persona if present"),
  userPrompt: z.string().describe("The main user prompt text"),
  tags: z.array(z.string()).describe("3-5 relevant tags"),
  compatibleModels: z.array(z.enum(["gemini-1.0-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-ultra", "gemini-2.0-flash-exp"])).default(["gemini-2.0-flash-exp"]),
  safetySettings: z.array(z.object({
    category: z.nativeEnum(HarmCategory),
    threshold: z.nativeEnum(HarmBlockThreshold)
  })).optional(),
  confidenceScore: z.number().describe("0-1 score of validity"),
  reasoning: z.string().describe("Why this was kept or discarded")
});

const CleanedPromptsResponseSchema = z.object({
  prompts: z.array(CleanedPromptOutputSchema)
});

export async function cleanPromptsWithLLM(rawPrompts: any[]): Promise<GeminiPrompt[]> {
  console.log(`✨ Starting LLM Cleaning for ${rawPrompts.length} candidates...`);

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  
  let model;

  if (apiKey) {
    console.log(`   Using Google Gemini 2.5 Flash (via Google AI Studio) [Key Length: ${apiKey.length}]`);
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    model = google('gemini-2.5-flash-preview-09-2025');
  } else if (githubToken) {
    console.log("   Using Gemini 1.5 Pro (via GitHub Models)");
    const githubOpenAI = createOpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: githubToken
    });
    model = githubOpenAI('gemini-1.5-pro-latest');
  } else {
    console.warn("⚠️ No AI API Key found. Skipping LLM cleaning.");
    return [];
  }

  const cleanedResults: GeminiPrompt[] = [];
  const BATCH_SIZE = 5;

  for (let i = 0; i < rawPrompts.length; i += BATCH_SIZE) {
    const batch = rawPrompts.slice(i, i + BATCH_SIZE);
    // Add temporary index for correlation
    const batchWithIndices = batch.map((item, idx) => ({ ...item, batchIndex: idx }));
    
    console.log(`   Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(rawPrompts.length/BATCH_SIZE)}...`);

    try {
      const { object } = await generateObject({
        model: model,
        schema: CleanedPromptsResponseSchema,
        prompt: `
          You are a Data Curator for a Gemini Prompt Database.
          Review these raw candidates (mostly from Reddit) and extract structured Gemini Prompts.

          CRITICAL RULES:
          1. **EXTRACT VERBATIM**: Do NOT rewrite, summarize, or "fix" the prompt text. Use the exact text found in the post.
          2. **DISCARD** questions, news, discussions, or bugs. KEEP only actual prompts.
          3. **SEPARATE** 'systemInstruction' (persona) vs 'userPrompt' (task) if clearly distinct in the text.
          4. **INFER** 'safetySettings' if the prompt is risky.
          5. **ASSIGN** 'compatibleModels' intelligently:
             - If simple/short, support [gemini-1.5-flash, gemini-2.0-flash-exp].
             - If complex/reasoning-heavy, support [gemini-1.5-pro, gemini-2.0-flash-exp].
             - **UPWARD COMPATIBILITY**: If it works on 1.5 Flash, it works on 1.5 Pro and 2.0 Flash. Always include the latest models.
          6. **RETURN** the 'batchIndex' for each item so we can map it back to the original data.
          7. **MULTI-PROMPT POSTS**: If a single candidate contains multiple prompts, extract them as separate items. **IMPORTANT**: ALL extracted items must share the SAME 'batchIndex' as the source candidate.

          RAW CANDIDATES:
          ${JSON.stringify(batchWithIndices, null, 2)}
        `,
      });

      for (const cleaned of object.prompts) {
        if (cleaned.confidenceScore > 0.7) {
          // Recover original metadata using batchIndex
          const original = batch[cleaned.batchIndex];
          
          // Map stats if available
          const stats = {
            views: 0,
            copies: 0,
            likes: original?.stats?.upvotes || original?.metaMetrics?.stars || 0
          };

          cleanedResults.push({
            id: crypto.randomUUID(),
            title: cleaned.title,
            description: cleaned.description,
            tags: cleaned.tags,
            compatibleModels: cleaned.compatibleModels,
            
            systemInstruction: cleaned.systemInstruction ? {
              parts: [{ text: cleaned.systemInstruction }]
            } : undefined,

            contents: [{
              role: "user",
              parts: [{ text: cleaned.userPrompt }]
            }],

            safetySettings: cleaned.safetySettings,
            
            author: {
              name: original?.author || "Community",
              platform: (original?.source === 'reddit' ? 'Reddit' : 
                         original?.source === 'github' ? 'GitHub' : 
                         original?.source === 'web' ? 'Google' : 'UserSubmission') as any,
              url: original?.authorUrl
            },
            originalSourceUrl: original?.url || original?.originUrl,
            stats: stats,
            createdAt: original?.date || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as GeminiPrompt);
          
          console.log(`      ✅ Kept: "${cleaned.title}" (Source: ${original?.source})`);
        }
      }

    } catch (error: any) {
      console.error("      ❌ Batch failed:", error.message);
    }
  }

  return cleanedResults;
}
