import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '../schema/prompt';

const DATA_FILE = path.join(process.cwd(), 'data', 'prompts.json');

export const MOCK_PROMPTS: GeminiPrompt[] = [
  {
    id: "1",
    title: "Sci-Fi Story Generator",
    description: "Generates creative sci-fi story concepts.",
    tags: ["creative", "writing"],
    compatibleModels: ["gemini-1.5-pro"],
    systemInstruction: {
      parts: [{ text: "Act as an award-winning sci-fi author." }]
    },
    contents: [{
      role: "user",
      parts: [{ text: "Write a story about a robot who learns to dream." }]
    }],
    author: {
      name: "GeminiFan",
      url: "https://github.com/geminifan",
      platform: "GitHub"
    },
    stats: { views: 100, copies: 10, likes: 5 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    title: "Python Optimizer",
    description: "Optimizes Python code for performance.",
    tags: ["coding", "python"],
    compatibleModels: ["gemini-1.5-pro", "gemini-1.5-flash"],
    contents: [{
      role: "user",
      parts: [{ text: "Optimize this Python function for time complexity..." }]
    }],
    author: {
      name: "CodeMaster",
      platform: "Reddit"
    },
    stats: { views: 50, copies: 2, likes: 10 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "3",
    title: "Invoice Extractor",
    description: "Extracts data from invoice text.",
    tags: ["data-extraction", "business"],
    compatibleModels: ["gemini-1.5-flash"],
    contents: [{
      role: "user",
      parts: [{ text: "Extract the following fields from the invoice text: invoice_id, date, total_amount, vendor_name." }]
    }],
    stats: { views: 200, copies: 50, likes: 25 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function generateMockData() {
  console.log('🧪 Generating Mock Data...');
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(MOCK_PROMPTS, null, 2));
  console.log(`✅ Successfully wrote ${MOCK_PROMPTS.length} mock prompts to data/prompts.json`);
}

generateMockData().catch(console.error);
