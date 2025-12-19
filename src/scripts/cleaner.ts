import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { GeminiPrompt, HarmCategory, HarmBlockThreshold } from '../schema/prompt';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

import { promises as fs } from 'fs';
import path from 'path';

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
  const useGithub = process.env.USE_GITHUB === 'true' || process.env.USE_GITHUB === '1';
  
  const modelScopeApiKey = process.env.MODELSCOPE_API_KEY;
  const useModelScope = process.env.USE_MODELSCOPE === 'true' || process.env.USE_MODELSCOPE === '1';
  
  let model: any;
  let azureClient: any;

  if (useModelScope && modelScopeApiKey) {
    console.log(`   Using ModelScope (DeepSeek-V3.2 via Raw Fetch) [Key Length: ${modelScopeApiKey.length}]`);
    // We do not initialize 'model' or 'azureClient' here.
    // The loop will handle 'useModelScope' directly via raw fetch.

  } else if (apiKey && !useGithub) {
    console.log(`   Using Google Gemini 2.5 Flash (via Google AI Studio) [Key Length: ${apiKey.length}]`);
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    model = google('gemini-2.5-flash-preview-09-2025');

  } else if (githubToken) {
    console.log("   Using AI21-Jamba-1.5-Large (via GitHub Models & Azure SDK)");
    azureClient = ModelClient(
      "https://models.github.ai/inference",
      new AzureKeyCredential(githubToken)
    );
  } else {
    console.warn("⚠️ No AI API Key found. Skipping LLM cleaning.");
    return [];
  }

  const cleanedResults: GeminiPrompt[] = [];
  // OPTIMIZATION: Reduced batch size to 5 for better yield and stability
  const BATCH_SIZE = 5;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < rawPrompts.length; i += BATCH_SIZE) {
    // Add rate limiting delay
    if (i > 0) {
      console.log("      ⏳ Waiting 5s to respect API rate limits...");
      await delay(5000);
    }

    const batch = rawPrompts.slice(i, i + BATCH_SIZE);
    const batchWithIndices = batch.map((item, idx) => ({ ...item, batchIndex: idx }));
    
    // Minify payload to save tokens
    const minifiedBatch = batchWithIndices.map(p => ({
        batchIndex: p.batchIndex,
        source: p.source,
        title: p.title,
        text: p.content || p.selftext || p.description || p.promptText || p.contents?.[0]?.parts?.[0]?.text || p.title || "",
        url: p.url || p.originalSourceUrl
    }));

    console.log(`   Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(rawPrompts.length/BATCH_SIZE)}...`);

    try {
      let cleanedBatch: z.infer<typeof CleanedPromptsResponseSchema>;

      if (model) {
        // ... (Gemini code placeholder) ...
        cleanedBatch = { prompts: [] }; // Placeholder to satisfy TS
      } else if (useModelScope) {
          // ModelScope (MiniMax) via Raw Fetch
          console.log("      🚀 Sending request to ModelScope (MiniMax/MiniMax-M1-80k)...");
          const response = await fetch("https://api-inference.modelscope.cn/v1/chat/completions", {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${modelScopeApiKey}`
             },
             body: JSON.stringify({
                model: "MiniMax/MiniMax-M1-80k",
                messages: [
                   { role: "system", content: "You are a helpful assistant. Extract prompts from the data and output valid JSON." },
                   { role: "user", content: `
                     EXTRACT PROMPTS FROM THIS RAW LIST.
                     
                     For each item in 'RAW DATA':
                     1. If it contains a usable AI Prompt (for image/text), extract it.
                     2. If it's just a question or discussion, IGNORE it.
                     3. Return the exact 'batchIndex'.

                     OUTPUT FORMAT (Must be valid JSON):
                     {
                       "prompts": [
                         {
                           "batchIndex": 0,
                           "title": "Short title",
                           "description": "Original text or summary",
                           "userPrompt": "The exact prompt text",
                           "tags": ["tag1", "tag2", "tag3"],
                           "compatibleModels": ["gemini-2.5-flash"],
                           "confidenceScore": 0.9,
                           "reasoning": "Valid prompt found"
                         }
                       ]
                     }

                     RAW DATA:
                     ${JSON.stringify(minifiedBatch)}
                   ` }
                ],
                temperature: 0.1,
                response_format: { type: "json_object" }
             })
          });

         console.log(`      📩 Received response: ${response.status} ${response.statusText}`);

         if (!response.ok) {
            const errText = await response.text();
            throw new Error(`ModelScope Error (${response.status}): ${errText}`);
         }

         const data = await response.json();
         let rawContent = data.choices?.[0]?.message?.content || "";
         
         console.log(`      📝 Raw content length: ${rawContent.length}`);
         // Robust JSON Extraction: Find first '{' and last '}'
         const firstOpen = rawContent.indexOf('{');
         const lastClose = rawContent.lastIndexOf('}');
         
         if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
             rawContent = rawContent.substring(firstOpen, lastClose + 1);
         }

         try {
            cleanedBatch = JSON.parse(rawContent);
            console.log(`      ✅ Parsed ${cleanedBatch.prompts?.length || 0} prompts.`);
         } catch (e) {
            console.error("JSON Parse Error on ModelScope response:", rawContent);
            throw e;
         }

      } else if (azureClient) {
        // Azure AI SDK (GitHub Models - Jamba/GPT-4o)
        // We must manually instruct for JSON since we aren't using generateObject
        const response = await azureClient.path("/chat/completions").post({
          body: {
            messages: [
              { role: "system", content: "You are a data cleaning assistant. You MUST respond with valid JSON only." },
              { role: "user", content: `
                Extract structured Gemini Prompts from the following raw data.
                
                OUTPUT SCHEMA (JSON):
                {
                  "prompts": [
                    {
                      "batchIndex": number,
                      "title": string,
                      "description": string,
                      "systemInstruction": string (optional),
                      "userPrompt": string,
                      "tags": string[],
                      "compatibleModels": string[],
                      "safetySettings": object[] (optional),
                      "confidenceScore": number,
                      "reasoning": string
                    }
                  ]
                }

                RULES:
                1. Extract verbatim.
                2. Discard garbage.
                3. Tags: 3 lowercase tags.
                4. Infer compatible models (e.g. gemini-2.5-flash for text, imagen-4.0 for images).
                
                RAW DATA:
                ${JSON.stringify(minifiedBatch)}
              ` }
            ],
            temperature: 0.0,
            model: "ai21-labs/AI21-Jamba-1.5-Large", 
            response_format: { type: "json_object" }
          }
        });

        if (isUnexpected(response)) {
          throw new Error("Azure SDK Error: " + JSON.stringify(response.body));
        }

        const rawContent = response.body.choices[0].message.content;
        // Parse JSON manually
        try {
           cleanedBatch = JSON.parse(rawContent);
        } catch (e) {
           console.error("JSON Parse Error on Azure response:", rawContent);
           throw e;
        }
      } else {
        throw new Error("No model or client available.");
      }

      // Tracking Rejections
      if (cleanedBatch && cleanedBatch.prompts) {
          const processedIndices = new Set(cleanedBatch.prompts.map(p => p.batchIndex));
          const rejectedItems = batchWithIndices.filter(p => !processedIndices.has(p.batchIndex));

          if (rejectedItems.length > 0) {
              const rejectedLogPath = path.join(process.cwd(), 'docs', 'rejected', 'rejected.json');
              let currentRejects = [];
              try {
                  const fileContent = await fs.readFile(rejectedLogPath, 'utf-8');
                  currentRejects = JSON.parse(fileContent);
              } catch {} 

              const newRejects = rejectedItems.map(item => ({
                  source: item.source,
                  title: item.title,
                  text: item.content || item.selftext || item.description || "",
                  reason: "LLM Discarded (Implicit)"
              }));

              await fs.writeFile(rejectedLogPath, JSON.stringify([...currentRejects, ...newRejects], null, 2));
          }
      }

      for (const cleaned of (cleanedBatch?.prompts || [])) {
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
            updatedAt: new Date().toISOString(),
            
            // Map Valid Images
            images: (original?.imageUrls && Array.isArray(original.imageUrls) && original.imageUrls.length > 0) 
              ? original.imageUrls.map((url: string) => ({
                  url: url,
                  label: "gallery" // Default to gallery for now, since we don't know input vs output yet
                }))
              : undefined
          } as GeminiPrompt);
          
          console.log(`      ✅ Kept: "${cleaned.title}" (Source: ${original?.source})`);
        } else {
             // Log explicitly rejected low confidence items
             const rejectedLogPath = path.join(process.cwd(), 'docs', 'rejected', 'rejected.json');
             let currentRejects = [];
             try {
                 const fileContent = await fs.readFile(rejectedLogPath, 'utf-8');
                 currentRejects = JSON.parse(fileContent);
             } catch {} // File might not exist yet

             const newReject = {
                 source: batch[cleaned.batchIndex]?.source,
                 title: cleaned.title,
                 text: cleaned.description,
                 reason: `LLM Discarded (Low Confidence: ${cleaned.confidenceScore})`
             };

             await fs.writeFile(rejectedLogPath, JSON.stringify([...currentRejects, newReject], null, 2));
             console.log(`      ❌ Rejected: "${cleaned.title}" (Low Confidence: ${cleaned.confidenceScore})`);
        }
      }

    } catch (error: any) {
      console.error("      ❌ Batch failed:", error.message);
    }
  }

  return cleanedResults;
}
