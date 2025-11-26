import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { suggestModelsForModality } from '../config/model-capabilities';
import { GeminiPrompt, PromptSchema } from '../schema/prompt';

// Define a schema for the cleaner's output (a list of cleaned prompts)
const CleanedPromptsSchema = z.object({
  prompts: z.array(PromptSchema.omit({ id: true, fetchedAt: true, inputSchema: true, outputSchema: true }).extend({
    inputSchema: z.string().optional().describe("JSON string of input schema if applicable"),
    outputSchema: z.string().optional().describe("JSON string of output schema if applicable"),
    originalSource: z.string().optional(),
    confidenceScore: z.number().describe("0-1 score of how likely this is a valid prompt"),
    reasoning: z.string().describe("Why this was kept or modified"),
    // Explicitly ask LLM for these new fields
    inputModality: z.array(z.enum(["text", "image", "video", "audio"])).describe("What input does this prompt expect?"),
    outputModality: z.array(z.enum(["text", "image", "video", "audio", "code"])).describe("What does this prompt generate?"),
    modelTarget: z.array(z.string()).describe("List of compatible models e.g. gemini-1.5-pro"),
    tags: z.array(z.string()).describe("3-5 tags. Combine flair with content analysis.")
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
          You are a strict Data Curator for a Prompt Engineering database.
          
          Your task is to review the following list of "Raw Prompt Candidates" scraped from Reddit/GitHub.
          
          ACTION REQUIRED:
          1. ANALYZE: Is this text primarily sharing a prompt for an LLM?
          2. DECISION:
             - If it is a QUESTION ("How do I..."): DISCARD.
             - If it is a BUG REPORT ("Gemini failed to..."): DISCARD.
             - If it is a NEWS item ("Gemini 1.5 released"): DISCARD.
             - If it is a SHOWCASE without the prompt ("Look at this image"): DISCARD.
             - If it contains a usable prompt: KEEP.
          3. EXTRACT:
             - 'promptText': The exact instruction to the AI. Remove conversational filler like "Here is the prompt:" or "I asked Gemini to:".
             - 'systemInstruction': If a persona is defined (e.g., "Act as a..."), extract it.
             - 'tags': Infer 3-5 relevant tags (e.g., "coding", "creative", "marketing").
             - 'inputSchema'/'outputSchema': If the prompt implies structured data, describe it as a JSON string.
          4. SPLIT: If the text contains multiple distinct prompts (e.g., "Here are 3 prompts for coding"), extract them as separate items.
          
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
            inputModality: cleaned.inputModality || ["text"],
            outputModality: cleaned.outputModality || ["text"],
            modelTarget: cleaned.modelTarget || ["gemini-1.5-pro"],
            sourcePlatform: cleaned.sourcePlatform || "unknown",
            originUrl: cleaned.originUrl || "",
            previewMediaUrl: (cleaned as any).previewMediaUrl || undefined // Pass through if LLM extracted it
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
  
  // 4. Post-processing: Validate Model Target based on Modality for CLEANED results
  const validatedCleanedResults = cleanedResults.map(p => {
    let validatedModelTarget = p.modelTarget || ["gemini-1.5-pro"];
    const outputModality = p.outputModality || ["text"];
    
    // If output is NOT just text/code, we must enforce specific models
    if (outputModality.some(m => m !== 'text' && m !== 'code')) {
       const suggested = suggestModelsForModality(outputModality);
       validatedModelTarget = suggested;
    }

    return {
      ...p,
      modelTarget: validatedModelTarget
    } as GeminiPrompt;
  });

  if (validatedCleanedResults.length === 0 && rawPrompts.length > 0) {
    console.warn("⚠️ LLM Cleaning produced 0 results (likely due to API errors). Falling back to RAW prompts.");
    // Fallback: return raw prompts with generated IDs and basic validation
    return rawPrompts.map(p => {
      let validatedModelTarget = p.modelTarget || ["gemini-1.5-pro"];
      const outputModality = p.outputModality || ["text"];
      
      // If output is NOT just text/code, we must enforce specific models
      if (outputModality.some(m => m !== 'text' && m !== 'code')) {
         const suggested = suggestModelsForModality(outputModality);
         validatedModelTarget = suggested;
      }

      return {
        ...p,
        id: p.id || crypto.randomUUID(),
        fetchedAt: p.fetchedAt || new Date().toISOString(),
        inputModality: p.inputModality || ["text"],
        outputModality: outputModality,
        modelTarget: validatedModelTarget,
        sourcePlatform: p.sourcePlatform || "unknown",
        originUrl: p.originUrl || "",
        previewMediaUrl: p.previewMediaUrl
      } as GeminiPrompt;
    });
  }

  return validatedCleanedResults;
}
