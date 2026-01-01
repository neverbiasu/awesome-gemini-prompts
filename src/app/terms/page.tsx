
import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-8 mb-12">
           <Link href="/" className="text-zinc-500 hover:text-white mb-4 block text-sm">← Back to Home</Link>
           <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
           <p className="text-zinc-500">Last updated: December 31, 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using Awesome Gemini Prompts, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">2. License & Copyright</h2>
          <p>
            The content (prompts, descriptions, and curated collections) on this website is licensed under the <strong>CC BY-NC-SA 4.0</strong> (Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International) license.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong>You are free to:</strong> Share and Adapt the material.</li>
            <li><strong>Under the following terms:</strong> You must give appropriate credit (Attribution) and you may not use the material for commercial purposes (NonCommercial). If you remix, transform, or build upon the material, you must distribute your contributions under the same license (ShareAlike).</li>
          </ul>
          <p>
             The source code of the website is available under the MIT License on GitHub.
          </p>
        </section>

        <section className="space-y-4">
           <h2 className="text-2xl font-bold text-white">3. Disclaimer</h2>
           <p className="uppercase text-zinc-400 text-sm tracking-wide">
             The materials on Awesome Gemini Prompts are provided on an 'as is' basis. Makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
           </p>
           <p>
             We do not guarantee that the prompts will generate specific results. AI models can be unpredictable. You use these prompts at your own risk.
           </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">4. User Contributions</h2>
          <p>
            If you submit prompts to us (via GitHub or Google Forms), you agree to license your contribution under the same CC BY-NC-SA 4.0 license, allowing us to display, distribute, and modify your work within this collection.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">5. Changes</h2>
          <p>
            We adhere to the philosophy of open source. Major changes to these terms will be reflected in our repository commit history.
          </p>
        </section>
      </div>
    </main>
  );
}
