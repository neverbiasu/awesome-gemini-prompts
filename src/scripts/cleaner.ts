import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { GeminiPrompt, GeminiPromptZodSchema, HarmCategory, HarmBlockThreshold } from '../schema/prompt';

// Define a schema for the cleaner's output that matches our new GeminiPrompt structure
// We use a subset of the full schema for the LLM to generate
const CleanedPromptOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  systemInstruction: z.string().optional().describe("The system instruction/persona if present"),
  userPrompt: z.string().describe("The main user prompt text"),
  tags: z.array(z.string()).describe("3-5 relevant tags"),
  compatibleModels: z.array(z.enum(["gemini-1.0-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-ultra", "gemini-2.5-flash-preview-09-2025"])).default(["gemini-2.5-flash-preview-09-2025"]),
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

  const apiKey = process.env.GEMINI_API_KEY;
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
          5. **ASSIGN** 'compatibleModels'.

          RAW CANDIDATES:
          ${JSON.stringify(batch, null, 2)}
        `,
      });

      for (const cleaned of object.prompts) {
        if (cleaned.confidenceScore > 0.7) {
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
              name: "Community",
              platform: "UserSubmission"
            },
            stats: { views: 0, copies: 0, likes: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as GeminiPrompt);
          
          console.log(`      ✅ Kept: "${cleaned.title}"`);
        }
      }

    } catch (error: any) {
      console.error("      ❌ Batch failed:", error.message);
    }
  }

  return cleanedResults;
}
