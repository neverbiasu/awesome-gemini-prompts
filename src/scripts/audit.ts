import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Config
const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const REPORT_FILE = path.join(process.cwd(), 'docs', 'reports', `Audit_Report_${new Date().toISOString().split('T')[0]}.md`);

interface AuditIssue {
    issueType: 'DUPLICATE' | 'LOW_QUALITY' | 'NEWS_NOISE' | 'BROKEN_CONTENT';
    targetIds: string[];
    description: string;
    action: 'DELETE' | 'MERGE' | 'KEEP';
    mergeTargetId?: string;
}

interface AuditReport {
    issues: AuditIssue[];
    summary: string;
}

async function main() {
    console.log("🕵️‍♀️ Starting Gemini Prompt Audit (Production DB)...");

    // 1. Load Prompts
    const content = await fs.readFile(PROMPTS_FILE, 'utf-8');
    const prompts = JSON.parse(content);
    console.log(`📦 Loaded ${prompts.length} prompts.`);

    // 2. Prepare Context (Minified for Token Efficiency)
    const minifiedPrompts = prompts.map((p: any) => ({
        id: p.id || 'no-id',
        t: p.title,
        d: (p.description || '').substring(0, 150)
    }));

    console.log("✨ Sending data to Gemini 2.5 Flash for cluster analysis...");
    
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API Key found.");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const generationConfig = {
            temperature: 0.1,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
        };

        // Limit to 300 prompts to avoid output truncation
        const limitedPrompts = minifiedPrompts.slice(0, 300);
        console.log(`   Analyzing ${limitedPrompts.length} prompts (limited for stability)...`);

        const prompt = `
            You are a database auditor. Analyze this dataset of ${limitedPrompts.length} AI Prompts.
            
            LOOK FOR:
            1. **Semantic Duplicates**: Entries with same topic (group them).
            2. **Low Quality**: Entries like "test", "...", "See notebook".
            3. **News/Noise**: News without actionable prompts.

            **DO NOT FLAG**:
            - Structured JSON prompts (NanoBanana style)
            - System Instructions
            - Multi-turn examples

            OUTPUT FORMAT (JSON, keep issues list SHORT - max 20 issues):
            {
              "issues": [
                {
                  "issueType": "DUPLICATE",
                  "targetIds": ["id1", "id2"],
                  "description": "Brief reason",
                  "action": "DELETE",
                  "mergeTargetId": "id1"
                }
              ],
              "summary": "Found X duplicates, Y low quality items"
            }
            
            DATASET:
            ${JSON.stringify(limitedPrompts)}
        `;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig
        });
        
        let responseText = result.response.text();
        
        // Attempt to repair truncated JSON
        if (!responseText.endsWith('}')) {
            console.log("⚠️ Response may be truncated, attempting repair...");
            // Find last complete issue and close the array/object
            const lastBrace = responseText.lastIndexOf('}');
            if (lastBrace > 0) {
                responseText = responseText.substring(0, lastBrace + 1);
                // Check if we need to close the issues array and main object
                if (!responseText.includes('"summary"')) {
                    responseText = responseText.replace(/,?\s*$/, '') + '], "summary": "Partial analysis due to truncation"}';
                }
            }
        }
        
        const auditResult: AuditReport = JSON.parse(responseText);

        // 4. Generate Outputs
        console.log(`✅ Audit Complete. Found ${auditResult.issues.length} issues.`);
        
        // Output 1: Human Readable Report (Markdown)
        let reportDetails = `# 🕵️‍♀️ Prompt Audit Report (${new Date().toISOString().split('T')[0]})\n\n`;
        reportDetails += `> **Instruction**: Review this report. If agreed, run \`npm run audit:apply\` to execute the changes defined in \`audit_plan.json\`.\n\n`;
        reportDetails += `**Summary**: ${auditResult.summary}\n\n`;
        reportDetails += `## Issues Found (${auditResult.issues.length})\n`;

        for (const issue of auditResult.issues) {
            reportDetails += `### [${issue.issueType}] ${issue.description}\n`;
            reportDetails += `- **Proposed Action**: \`${issue.action}\`\n`;
            if (issue.mergeTargetId) reportDetails += `- **Merge Target (Keep)**: \`${issue.mergeTargetId}\`\n`;
            reportDetails += `- **Affected Items**:\n`;
            
            issue.targetIds.forEach(id => {
                const original = prompts.find((p: any) => p.id === id);
                const snippet = original ? 
                    (original.description || original.title || '').substring(0, 50).replace(/\n/g, ' ') + '...' 
                    : 'Unknown';
                const modality = original?.modality?.[0] || 'text';
                
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
        console.log(`\n👉 Run 'npm run audit:apply' to apply changes.`);

    } catch (error: any) {
        console.error("❌ Audit Failed:", error.message);
        if (error.message.includes('429')) {
            console.log("⏳ Rate limited. Please wait a minute and try again.");
        }
    }
}

main();
