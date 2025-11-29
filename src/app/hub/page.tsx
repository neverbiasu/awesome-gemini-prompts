import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '@/schema/prompt';
import PromptCard from '@/components/PromptCard';

export const revalidate = 3600;

async function getPrompts(): Promise<GeminiPrompt[]> {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error("Data file not found", error);
    return [];
  }
}

export default async function HubPage() {
  const prompts = await getPrompts();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-16 text-center space-y-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            Awesome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4E8CFF] via-[#9B6EF3] to-[#FF9E64] animate-gradient">Gemini Prompts</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-light">
            The next-generation IDE for Gemini Prompt Engineering. 
            <br/>Automated collection, structured data, and rational design.
          </p>
        </header>
      
        {prompts.length === 0 ? (
          <div className="text-center text-default-500 mt-20">
            <p>No prompts found. Run the scraper to populate data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id || prompt.originalSourceUrl} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
