import { Card, CardBody } from "@heroui/card";
import Link from "next/link";
import { FaGithub, FaTwitter, FaRobot, FaDatabase, FaFilter } from "react-icons/fa";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-24 max-w-4xl">
      <div className="flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            About Awesome Gemini Prompts
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            The largest open-source collection of high-quality, hand-picked, and LLM-cleaned prompts for Google Gemini models.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-2 gap-6">
          <Card className="bg-zinc-900/50 border border-white/5 p-4">
            <CardBody className="gap-4">
              <div className="p-3 w-fit rounded-lg bg-blue-500/10 text-blue-400">
                <FaRobot size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">AI-Powered Cleaning</h3>
                <p className="text-zinc-400 mt-2">
                  Every prompt is analyzed, categorized, and cleaned by Gemini 2.5 Flash & ModelScope Qwen to ensure quality and safety.
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-zinc-900/50 border border-white/5 p-4">
            <CardBody className="gap-4">
              <div className="p-3 w-fit rounded-lg bg-purple-500/10 text-purple-400">
                <FaDatabase size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">1,000+ Curated Prompts</h3>
                <p className="text-zinc-400 mt-2">
                  Sourced from Reddit, GitHub, X (Twitter), and Google Docs. We filter out the noise so you don't have to.
                </p>
              </div>
            </CardBody>
          </Card>

            <Card className="bg-zinc-900/50 border border-white/5 p-4">
            <CardBody className="gap-4">
              <div className="p-3 w-fit rounded-lg bg-orange-500/10 text-orange-400">
                <FaFilter size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">Modality Aware</h3>
                <p className="text-zinc-400 mt-2">
                  Easily find prompts optimized for Text generation or Image creation (Imagen 3/4).
                </p>
              </div>
            </CardBody>
          </Card>

           <Card className="bg-zinc-900/50 border border-white/5 p-4">
            <CardBody className="gap-4">
              <div className="p-3 w-fit rounded-lg bg-emerald-500/10 text-emerald-400">
                <FaGithub size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-200">100% Open Source</h3>
                <p className="text-zinc-400 mt-2">
                  The entire database and crawler code is open source on GitHub. Contributions are welcome!
                </p>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* How to Use */}
        <section className="space-y-6 border-t border-white/10 pt-12">
            <h2 className="text-2xl font-bold text-zinc-200">How to Use</h2>
            <div className="space-y-4 text-zinc-400 leading-relaxed">
                <p>
                    1. <strong>Explore</strong>: Use the filters or search bar to find a prompt that fits your need.
                </p>
                <p>
                    2. <strong>One-Click Run</strong>: Click the <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 mx-1 text-xs">▶</span> button to open the prompt directly in Google AI Studio.
                </p>
                <p>
                    3. <strong>Copy System Instructions</strong>: For best results, detailed prompts often include a "System Instruction". Make sure to copy that into the System Instructions field in AI Studio or your API call.
                </p>
            </div>
        </section>

        {/* Footer / Links */}
         <section className="border-t border-white/10 pt-12 text-center space-y-8">
            <p className="text-zinc-500">
                This is a community-maintained project and is not officially affiliated with Google.
            </p>
            <div className="flex justify-center gap-6">
                <Link href="https://github.com/neverbiasu/awesome-gemini-prompts" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                    <FaGithub /> Star on GitHub
                </Link>
                <Link href="https://twitter.com/GeminiApp" className="text-zinc-400 hover:text-sky-400 transition-colors flex items-center gap-2">
                    <FaTwitter /> Follow Gemini
                </Link>
            </div>
         </section>

      </div>
    </div>
  );
}
