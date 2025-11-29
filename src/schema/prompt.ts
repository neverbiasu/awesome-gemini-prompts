import { z } from 'zod';

// Define Gemini models enum
export const GeminiModelEnum = z.enum(['gemini-pro', 'gemini-ultra', 'gemini-nano', 'gemini-1.5-pro']);

export const PromptSchema = z.object({
  id: z.string().uuid().optional(), // Optional for creation, required for storage
  title: z.string().min(5).max(150),
  promptText: z.string().min(10),
  systemInstruction: z.string().optional(),
  description: z.string().optional(), // Brief description of what the prompt does
  
  // Schema 2.0: Modality Split
  inputModality: z.array(z.enum(["text", "image", "video", "audio"])).default(["text"]),
  outputModality: z.array(z.enum(["text", "image", "video", "audio", "code"])).default(["text"]),
  
  // Schema 2.0: Model Compatibility
  modelTarget: z.array(z.string()).default(["gemini-1.5-pro", "gemini-1.5-flash"]),
  
  tags: z.array(z.string()).default([]),
  sourcePlatform: z.enum(['github', 'reddit', 'official_docs', 'web', 'social', 'user', 'unknown']),
  originUrl: z.string().url().optional(),
  
  // Schema 2.0: Media Preview (URL only)
  previewMediaUrl: z.string().url().optional(),
  
  inputSchema: z.any().optional(), // Stored as JSON string or object
  outputSchema: z.any().optional(), // Stored as JSON string or object
  
  // Quality Control
  confidenceScore: z.number().min(0).max(1).default(1.0),
  
  metaMetrics: z.object({
    upvotes: z.number().optional(),
    forks: z.number().optional(),
    stars: z.number().optional(),
    commentCount: z.number().optional()
  }).optional(),
  
  author: z.object({
    name: z.string(),
    profileUrl: z.string().url().optional()
  }).optional(),

  fetchedAt: z.string().datetime().optional()
});

export type GeminiPrompt = z.infer<typeof PromptSchema>;
