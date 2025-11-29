import { z } from 'zod';

/**
 * Strict mapping of Gemini API Harm Categories
 * Source: https://ai.google.dev/gemini-api/docs/safety-settings
 */
export enum HarmCategory {
  HARM_CATEGORY_HARASSMENT = "HARM_CATEGORY_HARASSMENT",
  HARM_CATEGORY_HATE_SPEECH = "HARM_CATEGORY_HATE_SPEECH",
  HARM_CATEGORY_SEXUALLY_EXPLICIT = "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  HARM_CATEGORY_DANGEROUS_CONTENT = "HARM_CATEGORY_DANGEROUS_CONTENT",
  HARM_CATEGORY_CIVIC_INTEGRITY = "HARM_CATEGORY_CIVIC_INTEGRITY"
}

/**
 * Harm Block Threshold Enum
 */
export enum HarmBlockThreshold {
  BLOCK_NONE = "BLOCK_NONE",
  BLOCK_ONLY_HIGH = "BLOCK_ONLY_HIGH",
  BLOCK_MEDIUM_AND_ABOVE = "BLOCK_MEDIUM_AND_ABOVE",
  BLOCK_LOW_AND_ABOVE = "BLOCK_LOW_AND_ABOVE",
  HARM_BLOCK_THRESHOLD_UNSPECIFIED = "HARM_BLOCK_THRESHOLD_UNSPECIFIED"
}

/**
 * Generation Config Object
 * Includes Gemini 1.5 specific responseMimeType
 */
export interface GenerationConfig {
  stopSequences?: string[];
  responseMimeType?: "text/plain" | "application/json";
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

/**
 * Core Gemini Prompt Entity Definition
 */
export interface GeminiPrompt {
  // Unique Identifier & Metadata
  id: string;             // UUID
  slug?: string;           // URL-friendly string (Optional for now, can be generated)
  title: string;
  description: string;
  tags: string[];         // e.g., "coding", "creative-writing", "json"
  
  // Version Control & Source Tracking
  version?: string;
  createdAt?: string;      // ISO 8601 format
  updatedAt?: string;
  author?: {
    name: string;
    url?: string;
    platform?: "Reddit" | "GitHub" | "Discord" | "UserSubmission" | "Google";
  };
  originalSourceUrl?: string; // Link to original post

  // Gemini Native API Structure
  // 1. System Instruction: Stored separately
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };

  // 2. Compatible Models (Support for multiple versions)
  compatibleModels: Array<"gemini-1.0-pro" | "gemini-1.5-pro" | "gemini-1.5-flash" | "gemini-ultra">;

  // 3. Core Content Area (Few-shot Examples)
  contents: Array<{
    role: "user" | "model";
    parts: Array<{
      text?: string;
      inlineData?: {      // Base64 image data for multimodal prompts
        mimeType: string;
        data: string;
      };
      fileData?: {        // File URI
        mimeType: string;
        fileUri: string;
      };
    }>;
  }>;

  // 4. Safety Settings Configuration
  safetySettings?: Array<{
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }>;

  generationConfig?: GenerationConfig;

  // 5. Statistical Metrics
  stats?: {
    views: number;
    copies: number;
    likes: number;
  };
}

// Zod Schema for Runtime Validation
export const GeminiPromptZodSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
  title: z.string().min(5).max(150),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  version: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  
  author: z.object({
    name: z.string(),
    url: z.string().url().optional(),
    platform: z.enum(["Reddit", "GitHub", "Discord", "UserSubmission", "Google"]).optional()
  }).optional(),
  
  originalSourceUrl: z.string().url().optional(),

  systemInstruction: z.object({
    parts: z.array(z.object({ text: z.string() }))
  }).optional(),

  compatibleModels: z.array(z.enum(["gemini-1.0-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-ultra", "gemini-2.5-flash-preview-09-2025"])).default(["gemini-2.5-flash-preview-09-2025"]),

  contents: z.array(z.object({
    role: z.enum(["user", "model"]),
    parts: z.array(z.object({
      text: z.string().optional(),
      inlineData: z.object({
        mimeType: z.string(),
        data: z.string()
      }).optional(),
      fileData: z.object({
        mimeType: z.string(),
        fileUri: z.string()
      }).optional()
    }))
  })).min(1),

  safetySettings: z.array(z.object({
    category: z.nativeEnum(HarmCategory),
    threshold: z.nativeEnum(HarmBlockThreshold)
  })).optional(),

  generationConfig: z.object({
    stopSequences: z.array(z.string()).optional(),
    responseMimeType: z.enum(["text/plain", "application/json"]).optional(),
    temperature: z.number().optional(),
    topP: z.number().optional(),
    topK: z.number().optional(),
    candidateCount: z.number().optional(),
    maxOutputTokens: z.number().optional(),
    presencePenalty: z.number().optional(),
    frequencyPenalty: z.number().optional(),
  }).optional(),

  stats: z.object({
    views: z.number(),
    copies: z.number(),
    likes: z.number()
  }).optional()
});
