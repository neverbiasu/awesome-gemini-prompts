import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Config
const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const REPORT_FILE = path.join(process.cwd(), 'docs', 'reports', `Audit_Report_${new Date().toISOString().split('T')[0]}.md`);

// Schema for Audit Result
const AuditIssueSchema = z.object({
    issueType: z.enum(['DUPLICATE', 'LOW_QUALITY', 'NEWS_NOISE', 'BROKEN_CONTENT']),
    targetIds: z.array(z.string()).describe("IDs of the problematic prompts"),
    description: z.string().describe("Explain why these are issues"),
    action: z.enum(['DELETE', 'MERGE', 'KEEP']).describe("Recommended action"),
    mergeTargetId: z.string().optional().describe("If MERGE, which ID to keep as the primary")
});

const AuditReportSchema = z.object({
    issues: z.array(AuditIssueSchema),
    summary: z.string().describe("High level summary of the audit")
});

async function main() {
    console.log("🕵️‍♀️ Starting Gemini Prompt Audit (Production DB)...");

    // 1. Load Prompts
    const content = await fs.readFile(PROMPTS_FILE, 'utf-8');
    const prompts = JSON.parse(content);
    console.log(`📦 Loaded ${prompts.length} prompts.`);

    // 2. Prepare Context (Minified for Token Efficiency)
    // We send ID, Title, Description only. Content is too heavy for full audit, usually Title/Desc reveals dupes.
    const minifiedPrompts = prompts.map((p: any) => ({
        id: p.id,
        t: p.title,
        d: p.description.substring(0, 150) // Truncate description
    }));

    // 3. Batching (Even Gemini Pro context has limits or latency, let's chunk if huge, but 900 items fits easily in 1M window)
    // 900 items * ~50 tokens = 45k tokens. Trivial for Gemini 1.5/2.0 Pro.
    
    console.log("✨ Sending data to Gemini 2.5 Flash for cluster analysis...");
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API Key found.");
        process.exit(1);
    }
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;

    try {
        const model = google('gemini-2.5-flash-preview-09-2025'); 
        
        const { object: auditResult } = await generateObject({
            model: model,
            schema: AuditReportSchema,
            system: "You are a database auditor. Your job is to find redundancy and garbage in a dataset of AI Prompts.",
            prompt: `
                ANALYZE THIS DATASET OF ${minifiedPrompts.length} PROMPTS.
                
                LOOK FOR:
                1. **Semantic Duplicates**: Entries that talk about the exact same thing (e.g. "Feynman Technique", "John Oliver", "Prompt Engineer").
                   - Even if titles differ slightly, if the core value is the same, flag them.
                2. **News/Noise**: Entries that are just news headlines (e.g. "GPT-4 Launched", "Gemini Update") without actionable prompts.
                3. **Low Quality**: Entries like "test", "...", or "See notebook".

                OUTPUT GUIDELINES:
                - Group duplicates together in 'targetIds'.
                - For duplicates, select the best one as 'mergeTargetId' (or leave blank if all should be deleted).
                - Be aggressive on Noise.
                
                DATASET:
                ${JSON.stringify(minifiedPrompts)}
            `
        });

        // 4. Generate Outputs
        console.log(`✅ Audit Complete. Found ${auditResult.issues.length} issues.`);
        
        // Output 1: Human Readable Report (Markdown)
        let reportDetails = `# 🕵️‍♀️ Prompt Audit Report (${new Date().toISOString().split('T')[0]})\n\n`;
        reportDetails += `> **Instruction**: Review this report. If agreed, run \`npm run audit:apply\` to execute the changes defined in \`audit_plan.json\`.\n\n`;
        reportDetails += `**Summary**: ${auditResult.summary}\n\n`;
        reportDetails += `## Issues Found\n`;

        for (const issue of auditResult.issues) {
            reportDetails += `### [${issue.issueType}] ${issue.description}\n`;
            reportDetails += `- **Proposed Action**: \`${issue.action}\`\n`;
            if (issue.mergeTargetId) reportDetails += `- **Merge Target (Keep)**: \`${issue.mergeTargetId}\`\n`;
            reportDetails += `- **Affected Items**:\n`;
            
            issue.targetIds.forEach(id => {
                const original = prompts.find((p: any) => p.id === id);
                const snippet = original ? 
                    (original.description || original.title).substring(0, 50).replace(/\n/g, ' ') + '...' 
                    : 'Unknown';
                const modality = original?.modality || original?.compatibleModels?.filter((m: string) => m.includes('image')).length ? 'image' : 'text';
                
                reportDetails += `  - \`[${id}]\` (${modality}): "${snippet}"\n`;
            });
            reportDetails += `\n---\n`;
        }

        // Output 2: Machine Actionable Plan (JSON)
        const planPath = path.join(DATA_DIR, 'audit_plan.json');
        await fs.writeFile(planPath, JSON.stringify(auditResult, null, 2));

        // Save Report
        await fs.mkdir(path.dirname(REPORT_FILE), { recursive: true });
        await fs.writeFile(REPORT_FILE, reportDetails);
        
        console.log(`📄 Preview Report saved to: ${REPORT_FILE}`);
        console.log(`🤖 Action Plan saved to: ${planPath}`);
        console.log(`\n👉 Run 'npm run audit:apply' (you need to create this script) to apply changes.`);

    } catch (error: any) {
        console.error("❌ Audit Failed:", error.message);
    }
}

main();
