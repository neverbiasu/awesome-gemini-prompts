
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-300 py-24 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-8 mb-12">
           <Link href="/" className="text-zinc-500 hover:text-white mb-4 block text-sm">← Back to Home</Link>
           <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
           <p className="text-zinc-500">Last updated: December 31, 2025</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
          <p>
            Awesome Gemini Prompts ("we", "our", or "us") is an open-source project dedicated to sharing prompts to the public. 
            We respect your privacy and represent that we do not collect personal identifiable information (PII) from our users.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">2. Data Collection</h2>
          <p>
            We do not require you to create an account to use our prompts. You can browse, copy, and run prompts anonymously.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong>Analytics:</strong> We use anonymous aggregated analytics (via Vercel Analytics or Google Analytics) to track page views and feature usage (e.g., how many times "Copy" is clicked). This data does not identify you personally.</li>
            <li><strong>Cookies:</strong> We use minimal local storage to save your preferences (e.g., UI state), but strictly necessary cookies only.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">3. Third-Party Services</h2>
          <p>
            Our service integrates with third-party platforms. Please review their privacy policies:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><strong>Google AI Studio:</strong> When you click "Run in AI Studio", you are redirected to Google's platform. Your improved prompt data is passed via URL parameters. We do not store this interaction.</li>
            <li><strong>Vercel:</strong> Our hosting provider may collect system logs for security and performance auditing.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">4. Open Source</h2>
          <p>
            This project is open source. The code is available on <a href="https://github.com/neverbiasu/awesome-gemini-prompts" className="text-blue-400 hover:underline">GitHub</a>. 
            We encourage transparency and invite users to audit our implementation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">5. Contact</h2>
          <p>
            If you have questions about this policy, please open an issue on our GitHub repository.
          </p>
        </section>
      </div>
    </main>
  );
}
