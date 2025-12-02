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
  tags: z.array(z.string()).describe("Exactly 3 relevant tags (lowercase, no 'google', 'gemini', 'prompt')"),
  compatibleModels: z.array(z.enum([
    "gemini-2.0-flash", 
    "gemini-2.5-flash", 
    "gemini-2.5-pro", 
    "gemini-3-pro-preview",
    "gemini-2.5-flash-image",
    "gemini-2.5-flash-image-preview",
    "gemini-3-pro-image-preview",
    "nano-banana-pro-preview",
    "imagen-4.0-generate-preview-06-06",
    "imagen-4.0-ultra-generate-preview-06-06"
  ])).default(["gemini-2.5-flash"]),
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
    model = githubOpenAI('gemini-2.5-pro');
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
          3. **TAGS**: Exactly 3 tags. lowercase. NO 'google', 'gemini', 'prompt', 'official'.
          4. **SEPARATE** 'systemInstruction' (persona) vs 'userPrompt' (task) if clearly distinct in the text.
          4. **INFER** 'safetySettings' if the prompt is risky.
          5. **ASSIGN** 'compatibleModels' intelligently:
             - **IMAGE GEN**: If it creates images, assign [imagen-4.0-generate-preview-06-06, imagen-4.0-ultra-generate-preview-06-06].
             - **IMAGE EDIT**: If it edits/transforms images, assign [gemini-2.5-flash-image, nano-banana-pro-preview, gemini-3-pro-image-preview].
             - **TEXT (SIMPLE)**: [gemini-2.5-flash, gemini-2.0-flash].
             - **TEXT (COMPLEX)**: [gemini-2.5-pro, gemini-3-pro-preview].
             - **UPWARD COMPATIBILITY**: If it works on Flash, it works on Pro.
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

          // Determine compatible models
          const compatibleModels: string[] = []; 
          
          const lowerDesc = cleaned.description.toLowerCase();
          const lowerTitle = cleaned.title.toLowerCase();
          
          // 1. Pure Image Generation (e.g. "Create an image of...")
          const isImageGen = lowerDesc.includes("generate an image") || lowerDesc.includes("create an image") || lowerDesc.includes("image of") || lowerTitle.includes("image generation");
          
          // 2. Image Editing / Multimodal (e.g. "Edit this", "Describe this image", "Nano Banana")
          // Note: "Nano Banana" prompts are typically image editing/generation via Gemini
          const isImageEdit = lowerDesc.includes("edit") || lowerDesc.includes("transform") || lowerDesc.includes("style") || lowerTitle.includes("nano banana") || lowerTitle.includes("image prompt");

          if (isImageGen) {
              compatibleModels.push("imagen-4.0-generate-preview-06-06", "imagen-4.0-ultra-generate-preview-06-06");
          } 
          
          if (isImageEdit || isImageGen) {
              // Add Gemini Image models for both generation and editing tasks
              compatibleModels.push(
                  "gemini-2.5-flash-image", 
                  "gemini-2.5-flash-image-preview", 
                  "gemini-3-pro-image-preview", 
                  "nano-banana-pro-preview"
              );
          }

          if (!isImageGen && !isImageEdit) {
              // Text / General Tasks
              // Default to Flash models
              compatibleModels.push("gemini-2.5-flash", "gemini-2.0-flash");
              
              // Check for complex reasoning needs
              if (lowerDesc.includes("complex") || lowerDesc.includes("reasoning") || lowerDesc.includes("code") || lowerDesc.includes("architect") || lowerDesc.includes("analyze")) {
                  compatibleModels.push("gemini-2.5-pro", "gemini-3-pro-preview");
              } else {
                  // Upward compatibility: If it works on Flash, it works on Pro
                  compatibleModels.push("gemini-2.5-pro"); 
              }
          }

          cleanedResults.push({
            id: crypto.randomUUID(),
            title: cleaned.title,
            description: cleaned.description,
            tags: cleaned.tags
                .map(t => t.toLowerCase())
                .filter(t => !['google', 'gemini', 'prompt', 'official', 'ai'].includes(t))
                .slice(0, 3),
            compatibleModels: compatibleModels,
            
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
