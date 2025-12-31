import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '@/schema/prompt';
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Card, CardBody } from "@heroui/card";
import { FaExternalLinkAlt, FaTwitter, FaGithub, FaReddit, FaDiscord, FaGlobe } from "react-icons/fa";
import { SiGoogle } from "react-icons/si";
import Link from 'next/link';
import PromptGrid from '@/components/PromptGrid';
import CopyButton from '@/components/CopyButton';
import { CompareSlider } from '@/components/CompareSlider';

export const revalidate = 0;

async function getPrompts(): Promise<GeminiPrompt[]> {
  const filePath = path.join(process.cwd(), 'data', 'prompts.json');
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

import { Metadata } from 'next';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const prompts = await getPrompts();
  const prompt = prompts.find(p => p.id === params.id);

  if (!prompt) {
    return {
      title: 'Prompt Not Found',
    };
  }

  const ogUrl = new URL('https://awesome-gemini-prompts.vercel.app/api/og');
  ogUrl.searchParams.set('title', prompt.title);
  ogUrl.searchParams.set('description', prompt.description);
  if (prompt.tags) {
    ogUrl.searchParams.set('tags', prompt.tags.slice(0, 3).join(','));
  }

  return {
    title: prompt.title,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: prompt.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: prompt.title,
      description: prompt.description,
      images: [ogUrl.toString()],
    },
  };
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  GitHub: FaGithub,
  Reddit: FaReddit,
  Google: SiGoogle,
  Twitter: FaTwitter,
  UserSubmission: FaGlobe,
  Discord: FaDiscord,
};

export default async function PromptDetailPage(props: PageProps) {
  const params = await props.params;
  const prompts = await getPrompts();
  const prompt = prompts.find(p => p.id === params.id);

  if (!prompt) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Prompt Not Found</h1>
          <Link href="/hub" className="text-blue-400 hover:underline">Back to Hub</Link>
        </div>
      </div>
    );
  }

  // Find related prompts (same tags)
  const relatedPrompts = prompts
    .filter(p => p.id !== prompt.id && p.tags?.some(t => prompt.tags?.includes(t)))
    .slice(0, 3);

  const PlatformIcon = PLATFORM_ICONS[prompt.author?.platform || 'Google'] || FaGlobe;

  return (
    <main className="min-h-screen bg-black text-zinc-200 relative overflow-hidden pb-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
        <Link href="/hub" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors">
          ← Back to Hub
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Chip 
              startContent={<PlatformIcon className="ml-1" />}
              variant="flat" 
              className="bg-white/10 text-white border border-white/10"
            >
              {prompt.author?.platform || 'Community'}
            </Chip>
            <span className="text-zinc-500 text-sm">
              {prompt.createdAt ? new Date(prompt.createdAt).toLocaleDateString() : 'Unknown Date'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {prompt.title}
          </h1>
          
          <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl">
            {prompt.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            {prompt.tags?.map(tag => (
              <Chip key={tag} size="sm" variant="dot" color="primary" className="border-none bg-blue-500/10 text-blue-400">
                {tag}
              </Chip>
            ))}
          </div>
        </header>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-12">
          <Button 
            as="a"
            href={prompt.originalSourceUrl || '#'}
            target="_blank"
            color="primary"
            variant="shadow"
            size="lg"
            endContent={<FaExternalLinkAlt />}
            className="font-semibold"
          >
            Open in {prompt.author?.platform || 'Source'}
          </Button>
        </div>

        {/* Image Comparison / Gallery */}
        {prompt.images && prompt.images.length >= 2 && (
          <section className="mb-12">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
              Visual Result
            </h3>
            <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-900/50">
              <CompareSlider 
                beforeImage={prompt.images[0].url}
                afterImage={prompt.images[1].url}
                beforeLabel={prompt.images[0].label || "Input / Reference"}
                afterLabel={prompt.images[1].label || "Output / Result"}
              />
            </div>
            {prompt.images.length > 2 && (
               <p className="text-zinc-500 text-sm mt-2 text-center">
                 + {prompt.images.length - 2} more images available in source
               </p>
            )}
          </section>
        )}
        
        {prompt.images && prompt.images.length === 1 && (
           <section className="mb-12">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                Visual Result
             </h3>
             <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={prompt.images[0].url} 
                  alt={prompt.images[0].alt || "Prompt Result"} 
                  className="w-full h-full object-cover"
                />
             </div>
           </section>
        )}

        {/* Content */}
        <div className="space-y-8">
          {prompt.systemInstruction && (
            <section>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                System Instructions
              </h3>
              <Card className="bg-zinc-900/50 border border-white/10 backdrop-blur-sm">
                <CardBody className="p-0 relative group">
                  <CopyButton 
                    text={prompt.systemInstruction.parts.map(p => p.text).join('\n')} 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                  />
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                    {prompt.systemInstruction.parts.map(p => p.text).join('\n')}
                  </pre>
                </CardBody>
              </Card>
            </section>
          )}

          {prompt.contents?.map((content, idx) => (
            <section key={idx}>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                {content.role === 'user' ? 'User Prompt' : 'Model Response'}
              </h3>
              <Card className="bg-zinc-900/50 border border-white/10 backdrop-blur-sm">
                <CardBody className="p-0 relative group">
                  <CopyButton 
                     text={content.parts.map(p => p.text).join('\n')} 
                     className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <pre className="p-6 overflow-x-auto text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                    {content.parts.map(p => p.text).join('\n')}
                  </pre>
                </CardBody>
              </Card>
            </section>
          ))}
        </div>

        {/* Related Prompts */}
        {relatedPrompts.length > 0 && (
          <section className="mt-20 pt-10 border-t border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">Related Prompts</h2>
            <PromptGrid prompts={relatedPrompts} />
          </section>
        )}
      </div>
    </main>
  );
}
