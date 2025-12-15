import { promises as fs } from 'fs';
import path from 'path';
import { GeminiPrompt } from '../schema/prompt';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');

// Helper to reliably map platform enum to readable source
const getSource = (p: GeminiPrompt) => {
    if (p.author?.platform) return p.author.platform.toLowerCase();
    if (p.originalSourceUrl?.includes('reddit')) return 'reddit';
    if (p.originalSourceUrl?.includes('github')) return 'github';
    return 'other';
};

async function main() {
    console.log("📊 Generating Scraper Summary Report...\n");

    try {
        // 1. Load Production Data
        const promptsContent = await fs.readFile(PROMPTS_FILE, 'utf-8');
        const prompts: GeminiPrompt[] = JSON.parse(promptsContent);

        // 2. Load Raw Data Stats (Optional, if files exist)
        const loadRaw = async (filename: string) => {
            try {
                const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
                return JSON.parse(content).length;
            } catch { return 0; }
        };

        const rawCounts = {
            reddit: await loadRaw('reddit.json'),
            github: await loadRaw('github.json'),
            x: await loadRaw('x.json'),
            web: await loadRaw('google_gallery.json') + await loadRaw('aistudio.json')
        };
        const rawTotal = Object.values(rawCounts).reduce((a, b) => a + b, 0);

        // 3. Analyze Production Data
        const stats = {
            total: prompts.length,
            bySource: {} as Record<string, number>,
            bySubSource: {} as Record<string, number>, // e.g. Subreddit or Repo
            byModality: { image: 0, text: 0, video: 0 },
            topTags: {} as Record<string, number>
        };

        prompts.forEach(p => {
            // Source
            const source = getSource(p);
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;

            // Sub-Source (Heuristics)
            let sub = 'unknown';
            if (source === 'reddit' && p.originalSourceUrl) {
                // Extract subreddit from URL
                const match = p.originalSourceUrl.match(/reddit\.com\/r\/([^/]+)/);
                if (match) sub = `r/${match[1]}`;
            } else if (source === 'github' && p.originalSourceUrl) {
                // Extract repo
                const match = p.originalSourceUrl.match(/github\.com\/([^/]+\/[^/]+)/);
                if (match) sub = match[1];
            }
            if (sub !== 'unknown') {
                stats.bySubSource[sub] = (stats.bySubSource[sub] || 0) + 1;
            }

            // Modality
            if (p.compatibleModels?.some(m => m.includes('image') || m.includes('nano'))) stats.byModality.image++;
            else if (p.compatibleModels?.some(m => m.includes('video'))) stats.byModality.video++;
            else stats.byModality.text++;

            // Tags
            p.tags?.forEach(t => {
                stats.topTags[t] = (stats.topTags[t] || 0) + 1;
            });
        });

        const reportLines: string[] = [];
        const log = (msg: string) => {
            console.log(msg);
            reportLines.push(msg);
        };

        log(`# 📊 Scraping Summary Report - ${new Date().toLocaleDateString()}`);
        log("");
        log(`**Generated At**: ${new Date().toLocaleString()}`);
        log("");

        log(`## 📈 Overview`);
        log(`- **Total Prompts in DB**: ${stats.total}`);
        log(`- **Total Raw Candidates**: ${rawTotal}`);
        log(`- **Overall Yield Rate**: ${((stats.total / rawTotal) * 100).toFixed(1)}% (Cleaned / Raw)`);
        log("");

        log(`## 🌊 By Source (Production)`);
        Object.entries(stats.bySource)
              .sort(([,a], [,b]) => b - a)
              .forEach(([k, v]) => {
                  const raw = k === 'reddit' ? rawCounts.reddit : 
                              k === 'github' ? rawCounts.github :
                              k === 'twitter' || k === 'x' ? rawCounts.x : 0;
                  const yieldRate = raw > 0 ? `Yield: ${((v/raw)*100).toFixed(0)}%` : '';
                  log(`- **${k.padEnd(10)}**: ${v.toString().padEnd(4)} ${yieldRate ? `(${yieldRate})` : ''}`);
              });
        log("");

        log(`## 🏆 Top Data Contributors (Sub-Sources)`);
        Object.entries(stats.bySubSource)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .forEach(([k, v]) => log(`- ${k}: ${v}`));
        log("");

        log(`## 🎨 Modality & Topics`);
        log(`- **Image/Vision**: ${stats.byModality.image}`);
        log(`- **Text/Code**   : ${stats.byModality.text}`);
        log(`- **Video**       : ${stats.byModality.video}`);
        log(`- **Top Tags**    : ${Object.entries(stats.topTags).sort(([,a], [,b]) => b - a).slice(0, 10).map(([k]) => k).join(", ")}`);
        log("");

        log(`## 💡 Actionable Insights`);
        if (rawCounts.reddit > 100 && stats.bySource['reddit'] < rawCounts.reddit * 0.1) {
             log("⚠️ **Reddit yield is low (<10%)**. Consider loosening filters or fixing extractor.");
        } else {
             log("✅ **Stats look healthy**. Keep it up!");
        }

        // Save Report
        const reportDir = path.join(process.cwd(), 'docs', 'reports');
        await fs.mkdir(reportDir, { recursive: true });
        const reportFile = path.join(reportDir, `Scrape_Report_${new Date().toISOString().split('T')[0]}.md`);
        await fs.writeFile(reportFile, reportLines.join('\n'), 'utf-8');
        console.log(`\n📄 Report saved to: ${reportFile}`);

    } catch (e: any) {
        console.error("❌ Failed to generate report:", e.message);
    }
}

main();
