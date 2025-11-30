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
  const allPrompts = await getPrompts();
  
  // Filter out prompts that don't have any text content
  const prompts = allPrompts.filter(p => 
    (p.contents && p.contents.length > 0 && p.contents[0].parts.some(part => part.text)) || 
    (p.promptText && p.promptText.trim().length > 0)
  );

  return (
    <main className="min-h-screen bg-black text-zinc-200 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Prompt Hub
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Explore {prompts.length} curated prompts for Gemini. Optimized for 1.5 Pro, Flash, and Ultra.
            </p>
          </div>
          
          {/* Stats / Filters (Placeholder for now) */}
          <div className="flex gap-2">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
               Latest Update: {new Date().toLocaleDateString()}
             </div>
          </div>
        </header>
      
        {prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
              <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-zinc-500">No prompts found in the database.</p>
            <p className="text-xs text-zinc-600">Run `npm run scrape` to populate data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id || prompt.originalSourceUrl} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
