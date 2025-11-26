import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { GeminiPrompt, PromptSchema } from '../schema/prompt';

// Define a schema for the cleaner's output (a list of cleaned prompts)
const CleanedPromptsSchema = z.object({
  prompts: z.array(PromptSchema.omit({ id: true, fetchedAt: true, inputSchema: true, outputSchema: true }).extend({
    inputSchema: z.string().optional().describe("JSON string of input schema if applicable"),
    outputSchema: z.string().optional().describe("JSON string of output schema if applicable"),
    originalSource: z.string().optional(),
    confidenceScore: z.number().describe("0-1 score of how likely this is a valid prompt"),
    reasoning: z.string().describe("Why this was kept or modified")
  }))
});

export async function cleanPromptsWithLLM(rawPrompts: Partial<GeminiPrompt>[]): Promise<GeminiPrompt[]> {
  console.log(`✨ Starting LLM Cleaning for ${rawPrompts.length} candidates...`);

  const apiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  
  let model;

  if (apiKey) {
    console.log("   Using Google Gemini 2.5 Pro (via Google AI Studio) - Free Tier Available!");
    
    // Set the env var expected by the default google provider
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    
    model = google('models/gemini-2.5-pro'); 
  } else if (githubToken) {
    console.log("   Using Gemini 2.5 Pro (via GitHub Models)");
    // Using the verified Gemini 2.5 Pro model from API list
    // Note: The ai-sdk `openai` provider is used here to connect to GitHub Models' OpenAI-compatible endpoint.
    // The model name 'gemini-2.5-pro' is passed to this endpoint.
    model = openai('gemini-2.5-pro', {
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: githubToken
    });
  } else {
    console.warn("⚠️ No AI API Key found (GEMINI_API_KEY or GITHUB_TOKEN). Skipping LLM cleaning.");
    return rawPrompts as GeminiPrompt[];
  }

  const cleanedResults: GeminiPrompt[] = [];

  // Process in batches to avoid hitting context limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < rawPrompts.length; i += BATCH_SIZE) {
    const batch = rawPrompts.slice(i, i + BATCH_SIZE);
    console.log(`   Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(rawPrompts.length/BATCH_SIZE)}...`);

    try {
      const { object } = await generateObject({
        model: model,
        schema: CleanedPromptsSchema,
        prompt: `
          You are an expert Prompt Engineer and Data Cleaner for "Awesome Gemini Prompts".
          
          Your task is to review the following list of "Raw Prompt Candidates" scraped from the web (Reddit, GitHub, etc.).
          Some of them might be bug reports, discussions, or irrelevant text. Some might be valid prompts but poorly formatted.

          ACTION REQUIRED:
          1. FILTER: Discard items that are clearly NOT prompts (e.g., "My Gemini is broken", "Look at this error").
          2. EXTRACT: If it IS a prompt, extract the core 'promptText'. Remove conversational filler like "Here is a prompt for you:".
          3. REFINE: 
             - Fix obvious typos.
             - Infer 'systemInstruction' if the user describes a persona (e.g., "Act as a...").
             - Infer 'tags' based on content.
             - Infer 'inputSchema' if the prompt expects structured input.
          4. SCORE: Assign a confidence score (0-1). We will only keep items > 0.7.

          RAW CANDIDATES:
          ${JSON.stringify(batch, null, 2)}
        `,
      });

      // Post-processing: Re-attach IDs and metadata, filter by confidence
      for (const cleaned of object.prompts) {
        if (cleaned.confidenceScore > 0.7) {
          cleanedResults.push({
            ...cleaned,
            id: crypto.randomUUID(),
            fetchedAt: new Date().toISOString(),
            // Ensure required fields are present
            modality: cleaned.modality || ["text"],
            sourcePlatform: cleaned.sourcePlatform || "unknown",
            originUrl: cleaned.originUrl || "",
          } as GeminiPrompt);
          console.log(`      ✅ Kept: "${cleaned.title}" (Score: ${cleaned.confidenceScore})`);
        } else {
          console.log(`      🗑️ Discarded: "${cleaned.title}" (Score: ${cleaned.confidenceScore} - ${cleaned.reasoning})`);
        }
      }

    } catch (error: any) {
      console.error("      ❌ Batch failed with detailed error:");
      if (error.responseBody) {
         console.error(error.responseBody);
      } else {
         console.error(JSON.stringify(error, null, 2));
      }
      // Also print the standard error message
      console.error("      Error message:", error.message);
      // Fallback: keep original if LLM fails? Or discard? 
      // For now, let's discard to be safe, or maybe log for manual review.
    }
  }

  console.log(`✨ Cleaning complete. Reduced ${rawPrompts.length} candidates to ${cleanedResults.length} high-quality prompts.`);
  
  if (cleanedResults.length === 0 && rawPrompts.length > 0) {
    console.warn("⚠️ LLM Cleaning produced 0 results (likely due to API errors). Falling back to RAW prompts.");
    // Fallback: return raw prompts with generated IDs
    return rawPrompts.map(p => ({
      ...p,
      id: p.id || crypto.randomUUID(),
      fetchedAt: p.fetchedAt || new Date().toISOString(),
      modality: p.modality || ["text"],
      sourcePlatform: p.sourcePlatform || "unknown",
      originUrl: p.originUrl || "",
    })) as GeminiPrompt[];
  }

  return cleanedResults;
}
