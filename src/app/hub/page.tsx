import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '@/schema/prompt';
import Fuse from 'fuse.js';
import HubClientLayout from '@/components/HubClientLayout';
import HubGridContainer from '@/components/HubGridContainer';

export const revalidate = 0;
const ITEMS_PER_PAGE = 12;

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
  searchParams: Promise<{ 
    q?: string; 
    page?: string; 
    sort?: string; 
    models?: string; 
    modality?: string;
    tags?: string;
  }>;
}

interface LegacyPrompt extends GeminiPrompt {
  metaMetrics?: { stars?: number; upvotes?: number };
  fetchedAt?: string | number;
  sourcePlatform?: string;
}

export default async function HubPage(props: HubPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q;
  const page = Number(searchParams.page) || 1;
  const sort = searchParams.sort || 'relevance';
  
  // Parse Filters
  const models = searchParams.models?.split(',').filter(Boolean);
  const modality = searchParams.modality?.split(',').filter(Boolean);
  const tags = searchParams.tags?.split(',').filter(Boolean);

  const allPrompts = await getPrompts();
  
  // 1. Initial Filtering (Content Check)
  let validPrompts = allPrompts.filter(p => 
    (p.contents && p.contents.length > 0 && p.contents[0].parts.some(part => part.text)) || 
    (p.promptText && p.promptText.trim().length > 0) ||
    (p.systemInstruction && p.systemInstruction.parts && p.systemInstruction.parts.some(part => part.text))
  );

  // 2. Advanced Filtering
  if (modality && modality.length > 0) {
    validPrompts = validPrompts.filter(p => {
       const pModality = p.modality || [];
       return modality.some(m => pModality.includes(m as any));
    });
  }

  if (models && models.length > 0) {
    validPrompts = validPrompts.filter(p => {
       const pModels = p.compatibleModels || [];
       return models.some(m => pModels.some(pm => pm.includes(m)));
    });
  }
  
  if (tags && tags.length > 0) {
      validPrompts = validPrompts.filter(p => {
          const pTags = p.tags || [];
          return tags.some(t => pTags.includes(t));
      });
  }

  // 3. Search Logic
  if (query) {
    const fuse = new Fuse(validPrompts, {
      keys: ['title', 'description', 'tags', 'contents.parts.text'],
      threshold: 0.4,
      ignoreLocation: true
    });
    validPrompts = fuse.search(query).map(result => result.item);
  }

  // 4. Sorting Logic
  const sortedPrompts = validPrompts.sort((a, b) => {
    const getLikes = (p: GeminiPrompt) => {
      const legacy = p as LegacyPrompt;
      return p.stats?.likes || legacy.metaMetrics?.stars || legacy.metaMetrics?.upvotes || 0;
    };
    
    const getDate = (p: GeminiPrompt) => {
       const legacy = p as LegacyPrompt;
       return new Date(p.createdAt || legacy.fetchedAt || 0).getTime();
    };

    if (sort === 'newest') return getDate(b) - getDate(a);
    if (sort === 'popular') return getLikes(b) - getLikes(a);

    // Default: Relevance
    const legacyA = a as LegacyPrompt;
    const legacyB = b as LegacyPrompt;
    
    const isGoogleA = a.author?.platform === 'Google' || legacyA.sourcePlatform === 'official_docs';
    const isGoogleB = b.author?.platform === 'Google' || legacyB.sourcePlatform === 'official_docs';
    
    if (isGoogleA && !isGoogleB) return -1;
    if (!isGoogleA && isGoogleB) return 1;

    const likesA = getLikes(a);
    const likesB = getLikes(b);
    if (likesB !== likesA) return likesB - likesA;
    
    return getDate(b) - getDate(a);
  });

  // 5. Pagination
  const totalItems = sortedPrompts.length;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const prompts = sortedPrompts.slice(startIndex, endIndex);

  // 6. Aggregate Top Tags
  const tagCounts: Record<string, number> = {};
  allPrompts.forEach(p => {
    p.tags?.forEach(t => {
      const tag = t.toLowerCase();
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([tag]) => tag);

  return (
    <main className="min-h-screen bg-black text-zinc-200 relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="mb-8 flex flex-col items-center gap-6">
          <div className="text-center space-y-4 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Prompt Hub
            </h1>
            <p className="text-zinc-400 text-sm md:text-base">
              Explore {totalItems} curated prompts for Gemini. Optimized for 2.0 Flash, 2.5 Pro, and 3.0.
            </p>
          </div>
        </header>
      
        <HubClientLayout 
          totalItems={totalItems} 
          updatedDate={new Date().toLocaleDateString()}
        >
          <HubGridContainer 
            prompts={prompts}
            topTags={topTags}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </HubClientLayout>
      </div>
    </main>
  );
}
