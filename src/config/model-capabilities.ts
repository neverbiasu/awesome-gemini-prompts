// Source: docs/gemini/pricing.md
// Defines the capabilities of each Gemini model to ensure data consistency.

export interface ModelCapability {
  id: string;
  name: string;
  inputModality: ("text" | "image" | "video" | "audio")[];
  outputModality: ("text" | "image" | "video" | "audio" | "code")[];
  isPreview: boolean;
}

export const GEMINI_MODELS: Record<string, ModelCapability> = {
  // --- Gemini 3 Series ---
  'gemini-3-pro-preview': {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    inputModality: ['text', 'image', 'video', 'audio'],
    outputModality: ['text', 'code'], // Text only output
    isPreview: true
  },
  'gemini-3-pro-image-preview': {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image Preview (Nano Banana)',
    inputModality: ['text'],
    outputModality: ['image'], // Native image generation
    isPreview: true
  },

  // --- Gemini 2.5 Series ---
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    inputModality: ['text', 'image', 'video', 'audio'],
    outputModality: ['text', 'code'],
    isPreview: false
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    inputModality: ['text', 'image', 'video', 'audio'],
    outputModality: ['text', 'code'],
    isPreview: false
  },
  'gemini-2.5-flash-image': {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    inputModality: ['text'],
    outputModality: ['image'],
    isPreview: false
  },
  'gemini-2.5-flash-native-audio-preview-09-2025': {
    id: 'gemini-2.5-flash-native-audio-preview-09-2025',
    name: 'Gemini 2.5 Flash Audio',
    inputModality: ['text', 'audio'],
    outputModality: ['audio'],
    isPreview: true
  },

  // --- Specialized Models ---
  'imagen-3.0-generate-002': {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3',
    inputModality: ['text'],
    outputModality: ['image'],
    isPreview: false
  },
  'veo-3.1-generate-preview': {
    id: 'veo-3.1-generate-preview',
    name: 'Veo 3.1',
    inputModality: ['text'], // Usually text-to-video
    outputModality: ['video'],
    isPreview: true
  }
};

/**
 * Helper to suggest models based on required output modality.
 */
export function suggestModelsForModality(output: ("text" | "image" | "video" | "audio" | "code")[]): string[] {
  const candidates: string[] = [];
  
  // Heuristic: If output contains 'image', must use Image model
  if (output.includes('image')) {
    candidates.push('gemini-3-pro-image-preview', 'gemini-2.5-flash-image', 'imagen-3.0-generate-002');
  } 
  // If output contains 'video', must use Veo
  else if (output.includes('video')) {
    candidates.push('veo-3.1-generate-preview');
  }
  // If output contains 'audio', must use Audio model
  else if (output.includes('audio')) {
    candidates.push('gemini-2.5-flash-native-audio-preview-09-2025');
  }
  // Default to Text/Code models
  else {
    candidates.push('gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash');
  }

  return candidates;
}
