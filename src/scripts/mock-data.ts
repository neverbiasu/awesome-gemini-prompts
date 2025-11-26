import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '../schema/prompt';

const DATA_FILE = path.join(process.cwd(), 'data', 'prompts.json');

export const MOCK_PROMPTS: GeminiPrompt[] = [
  {
    id: "1",
    title: "Creative Storyteller",
    promptText: "Write a short story about a robot who discovers emotions...",
    systemInstruction: "Act as an award-winning sci-fi author.",
    tags: ["creative", "writing", "sci-fi"],
    sourcePlatform: "user",
    originUrl: "https://example.com",
    modelTarget: ["gemini-1.5-pro", "gemini-ultra"],
    inputModality: ["text"],
    outputModality: ["text"],
    confidenceScore: 1.0,
    metaMetrics: {
      upvotes: 120,
      stars: 45
    },
    author: {
      name: "GeminiFan",
      profileUrl: "https://github.com/geminifan"
    },
    fetchedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Code Optimizer",
    promptText: "Optimize this Python function for time complexity...",
    tags: ["coding", "python", "optimization"],
    sourcePlatform: "github",
    originUrl: "https://github.com/some-repo/code-optimizer",
    modelTarget: ["gemini-1.5-pro"],
    inputModality: ["text"],
    outputModality: ["code"],
    confidenceScore: 0.95,
    metaMetrics: {
      upvotes: 80,
      stars: 30
    },
    fetchedAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "JSON Data Extractor",
    promptText: "Extract the following fields from the invoice text: invoice_id, date, total_amount, vendor_name.",
    tags: ["data-extraction", "json"],
    sourcePlatform: "web",
    originUrl: "https://example.com/json",
    modelTarget: ["gemini-1.5-flash"],
    inputModality: ["text"],
    outputModality: ["code"],
    confidenceScore: 0.88,
    outputSchema: {
      type: "object",
      properties: {
        invoice_id: { type: "string" },
        total_amount: { type: "number" }
      }
    },
    metaMetrics: { upvotes: 45 },
    fetchedAt: new Date().toISOString()
  }
];

async function generateMockData() {
  console.log('🧪 Generating Mock Data...');
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(MOCK_PROMPTS, null, 2));
  console.log(`✅ Successfully wrote ${MOCK_PROMPTS.length} mock prompts to data/prompts.json`);
}

generateMockData().catch(console.error);
