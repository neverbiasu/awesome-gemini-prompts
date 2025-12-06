import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '@/schema/prompt';
import PromptGrid from '@/components/PromptGrid';

export const revalidate = 0;

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

interface HubPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function HubPage(props: HubPageProps) {
  const searchParams = await props.searchParams;
  const category = searchParams.category?.toLowerCase();
  
  const allPrompts = await getPrompts();
  
  // Filter out prompts that don't have any text content
  let validPrompts = allPrompts.filter(p => 
    (p.contents && p.contents.length > 0 && p.contents[0].parts.some(part => part.text)) || 
    (p.promptText && p.promptText.trim().length > 0) ||
    (p.systemInstruction && p.systemInstruction.parts && p.systemInstruction.parts.some(part => part.text))
  );

  // Category Filtering
  if (category) {
    validPrompts = validPrompts.filter(p => {
      const tags = p.tags?.map(t => t.toLowerCase()) || [];
      if (category === 'text') {
        // Text is default. Exclude prompts that are explicitly tagged as image, video, or audio.
        // We check if any tag *contains* these keywords (e.g. "image generation" matches "image")
        return !tags.some(t => 
          t.includes('image') || 
          t.includes('video') || 
          t.includes('audio') ||
          t.includes('music') ||
          t.includes('speech')
        );
      }
      return tags.some(t => t.includes(category));
    });
  }

  // Sorting Logic
  const prompts = validPrompts.sort((a, b) => {
    // 1. Priority: Official Google Sources
    const isGoogleA = a.author?.platform === 'Google' || (a as any).sourcePlatform === 'official_docs';
    const isGoogleB = b.author?.platform === 'Google' || (b as any).sourcePlatform === 'official_docs';
    
    if (isGoogleA && !isGoogleB) return -1;
    if (!isGoogleA && isGoogleB) return 1;

    // 2. Priority: Likes/Upvotes/Stars (Descending)
    const likesA = a.stats?.likes || (a as any).metaMetrics?.stars || (a as any).metaMetrics?.upvotes || 0;
    const likesB = b.stats?.likes || (b as any).metaMetrics?.stars || (b as any).metaMetrics?.upvotes || 0;

    if (likesB !== likesA) {
      return likesB - likesA;
    }

    // 3. Priority: Date (Newest First)
    const dateA = new Date(a.createdAt || (a as any).fetchedAt || 0).getTime();
    const dateB = new Date(b.createdAt || (b as any).fetchedAt || 0).getTime();
    
    return dateB - dateA;
  });

  return (
    <main className="min-h-screen bg-black text-zinc-200 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Prompts` : 'Prompt Hub'}
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Explore {prompts.length} curated prompts for Gemini. Optimized for 2.0 Flash, 2.5 Pro, and 3.0.
            </p>
          </div>
          
          {/* Stats / Filters (Placeholder for now) */}
          <div className="flex gap-2">
             <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
               Latest Update: {new Date().toLocaleDateString()}
             </div>
          </div>
        </header>
      
        <PromptGrid prompts={prompts} />
      </div>
    </main>
  );
}
