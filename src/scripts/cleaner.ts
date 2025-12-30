import { GoogleGenerativeAI } from '@google/generative-ai';
import * as crypto from 'crypto';



import { z } from 'zod';
import { GeminiPrompt, HarmCategory, HarmBlockThreshold } from '../schema/prompt';



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

export async function batchCleanPrompts(rawPrompts: any[]) {
  console.log(`✨ Starting LLM Cleaning for ${rawPrompts.length} candidates...`);

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
      console.error("❌ SKIPPING LLM CLEANING: No GOOGLE_GENERATIVE_AI_API_KEY found.");
      return [];
  }
  
  console.log(`   Using Google Gemini 2.5 Flash (via Google Generative AI SDK)`);

  const BATCH_SIZE = 5;
  const cleanedResults: GeminiPrompt[] = [];

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
      // ---------------------------------------------------------
      // STRATEGY: GOOGLE GEMINI API (Primary) with ModelScope Fallback
      // ---------------------------------------------------------
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const generationConfig = {
          temperature: 0.1,
          responseMimeType: "application/json",
      };

      const prompt = `
          You are an expert Data Cleaner for an AI Prompt Library.
          Your task is to extract, clean, and standardize AI Prompts from raw scraped data.

          For each item in the 'RAW_DATA' list below:
          1. **Analyze**: Is this a valid AI Prompt or System Instruction? (Ignore news, discussions, or simple questions).
          2. **Extract**:
              - **Title**: Create a concise, catchy title (max 5-8 words).
              - **Description**: Summary of what the prompt does.
              - **UserPrompt**: The actual prompt text to be copy-pasted. (If split across parts, merge them).
              - **Tags**: Assign 1-3 tags from: [coding, creative-writing, productivity, image-generation, data-analysis, marketing, education, fun].
          3. **Filter**:
              - DISCARD items that are just news ("Google released Gemini...").
              - DISCARD items that are simple questions ("How do I use...").
              - DISCARD truncated or garbage items.
          
          OUTPUT FORMAT (JSON Array):
          {
            "prompts": [
              {
                "batchIndex": 0,
                "title": "...",
                "description": "...",
                "userPrompt": "...",
                "tags": ["..."],
                "compatibleModels": ["gemini-2.5-flash"],
                "confidenceScore": 0.95
              }
            ]
          }

          RAW_DATA:
          ${JSON.stringify(minifiedBatch)}
      `;

      let cleanedBatch: z.infer<typeof CleanedPromptsResponseSchema>;
      let usedFallback = false;
      
      try {
        const result = await model.generateContent({
             contents: [{ role: "user", parts: [{ text: prompt }] }],
             generationConfig
        });
        const responseText = result.response.text();
        cleanedBatch = JSON.parse(responseText);
      } catch (err: any) {
        // Check if it's a quota exceeded error (429)
        if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
          console.log("      ⚠️ Gemini quota exceeded, switching to ModelScope...");
          
          // Fallback to ModelScope
          const modelScopeKey = process.env.MODELSCOPE_API_KEY;
          if (!modelScopeKey) {
            console.error("      ❌ No MODELSCOPE_API_KEY found, skipping batch.");
            continue;
          }
          
          try {
            const msResponse = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${modelScopeKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'Qwen/Qwen2.5-72B-Instruct',
                messages: [
                  { role: 'system', content: 'You are a helpful assistant that outputs valid JSON.' },
                  { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' }
              })
            });
            
            if (!msResponse.ok) {
              console.error(`      ❌ ModelScope API error: ${msResponse.status}`);
              continue;
            }
            
            const msData = await msResponse.json();
            let msText = msData.choices?.[0]?.message?.content || '{}';
            // Clean markdown code blocks if present (handles ```json ... ``` format)
            msText = msText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            // Find the first { and last } to extract JSON
            const jsonStart = msText.indexOf('{');
            const jsonEnd = msText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              msText = msText.substring(jsonStart, jsonEnd + 1);
            }
            cleanedBatch = JSON.parse(msText);
            usedFallback = true;
            console.log("      ✅ ModelScope fallback successful");
          } catch (msErr) {
            console.error("      ❌ ModelScope fallback failed:", msErr);
            continue;
          }
        } else {
          console.error("Gemini Generation Error:", err);
          continue;
        }
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
          
          const isImageGen = lowerDesc.includes("generate an image") || lowerDesc.includes("create an image") || lowerDesc.includes("image of") || lowerTitle.includes("image generation");
          const isImageEdit = lowerDesc.includes("edit") || lowerDesc.includes("transform") || lowerDesc.includes("style") || lowerTitle.includes("nano banana") || lowerTitle.includes("image prompt");

          if (isImageGen) {
              compatibleModels.push("imagen-4.0-generate-preview-06-06", "imagen-4.0-ultra-generate-preview-06-06");
          } 
          
          if (isImageEdit || isImageGen) {
              compatibleModels.push("gemini-2.5-flash-image", "gemini-2.5-flash-image-preview", "gemini-3-pro-image-preview", "nano-banana-pro-preview");
          }

          if (!isImageGen && !isImageEdit) {
              compatibleModels.push("gemini-2.5-flash", "gemini-2.0-flash");
              if (lowerDesc.includes("complex") || lowerDesc.includes("reasoning") || lowerDesc.includes("code") || lowerDesc.includes("architect") || lowerDesc.includes("analyze")) {
                  compatibleModels.push("gemini-2.5-pro", "gemini-3-pro-preview");
              } else {
                  compatibleModels.push("gemini-2.5-pro"); 
              }
          }

          // Determine modality based on compatible models
          const modality: string[] = [];
          if (isImageGen || isImageEdit) {
            modality.push('image');
          }
          if (!isImageGen && !isImageEdit) {
            modality.push('text');
          }

          // Deterministic ID Generation
          const idSource = original?.url || original?.originUrl || original?.originalSourceUrl || (cleaned.title + cleaned.userPrompt.substring(0, 50));
          const deterministicId = original?.source + '-' + crypto.createHash('md5').update(idSource).digest('hex').substring(0, 12);

          const finalPrompt: GeminiPrompt = {
            id: deterministicId, // STABLE ID
            title: cleaned.title,
            description: cleaned.description,
            tags: cleaned.tags
                .map(t => t.toLowerCase())
                .filter(t => !['google', 'gemini', 'prompt', 'official', 'ai'].includes(t))
                .slice(0, 3),
            compatibleModels: compatibleModels as any, // Cast to any to bypass strict literal check (we know values are valid)
            modality: modality as any,
            
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
              platform: (original?.source === 'reddit' ? 'Reddit' : original?.source === 'github' ? 'GitHub' : original?.source === 'web' ? 'Google' : 'UserSubmission') as any,
              url: original?.authorUrl
            },
            originalSourceUrl: original?.url || original?.originUrl || original?.originalSourceUrl,
            stats: stats,
            createdAt: original?.created_utc 
              ? new Date(original.created_utc * 1000).toISOString() 
              : original?.date || original?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(), // Processing timestamp for new entries
            images: (original?.imageUrls && Array.isArray(original.imageUrls) && original.imageUrls.length > 0) 
              ? original.imageUrls.map((url: string) => ({ url, label: "gallery" }))
              : undefined
          };

          cleanedResults.push(finalPrompt);
          console.log(`      ✅ Kept: "${cleaned.title}" (ID: ${deterministicId})`);
        } else {
             // Log explicitly rejected
             const rejectedLogPath = path.join(process.cwd(), 'docs', 'rejected', 'rejected.json');
             let currentRejects = [];
             try { currentRejects = JSON.parse(await fs.readFile(rejectedLogPath, 'utf-8')); } catch {}
             
             await fs.writeFile(rejectedLogPath, JSON.stringify([...currentRejects, {
                 source: batch[cleaned.batchIndex]?.source,
                 title: cleaned.title,
                 text: cleaned.description,
                 reason: `LLM Discarded (Low Confidence: ${cleaned.confidenceScore})`
             }], null, 2));
             console.log(`      ❌ Rejected: "${cleaned.title}" (Low Confidence: ${cleaned.confidenceScore})`);
        }
      }

    } catch (error: any) {
      console.error("      ❌ Batch failed:", error.message);
    }
  }

  return cleanedResults;
}
