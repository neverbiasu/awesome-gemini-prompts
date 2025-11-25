import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '../schema/prompt';

const DATA_FILE = path.join(process.cwd(), 'data', 'prompts.json');

const MOCK_PROMPTS: GeminiPrompt[] = [
  {
    id: crypto.randomUUID(),
    title: "Code Refactoring Expert",
    promptText: "Analyze the provided code snippet for performance bottlenecks, readability issues, and anti-patterns. Suggest improvements with explained reasoning and provide the refactored code using modern best practices.",
    systemInstruction: "You are a senior software engineer specializing in code refactoring.",
    tags: ["coding", "refactoring"],
    sourcePlatform: "github",
    originUrl: "https://github.com/awesome-prompts/code-refactor",
    modelTarget: "gemini-1.5-pro",
    modality: ["text"],
    metaMetrics: { stars: 120 },
    fetchedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "Visual Storyteller",
    promptText: "Based on this image, write a short mystery story about what happened just before this scene.",
    tags: ["creative", "writing", "multimodal"],
    sourcePlatform: "official_docs",
    originUrl: "https://ai.google.dev/gemini-api/prompts/storyteller",
    modelTarget: "gemini-pro-vision",
    modality: ["text", "image"],
    fetchedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: "JSON Data Extractor",
    promptText: "Extract the following fields from the invoice text: invoice_id, date, total_amount, vendor_name.",
    tags: ["data-extraction", "json"],
    sourcePlatform: "reddit",
    originUrl: "https://reddit.com/r/GoogleGeminiAI/comments/12345/json_extraction",
    modelTarget: "gemini-1.5-flash",
    modality: ["text"],
    outputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" },
        total_amount: { type: "number" }
      }
    },
    metaMetrics: { upvotes: 45 },
    fetchedAt: new Date().toISOString(),
  }
];

async function generateMockData() {
  console.log('🧪 Generating Mock Data...');
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(MOCK_PROMPTS, null, 2));
  console.log(`✅ Successfully wrote ${MOCK_PROMPTS.length} mock prompts to data/prompts.json`);
}

generateMockData().catch(console.error);
