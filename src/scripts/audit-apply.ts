import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompts.json');
const PLAN_FILE = path.join(DATA_DIR, 'audit_plan.json');

async function main() {
    console.log("🤖 Starting Audit Application...");

    try {
        // 1. Load Data
        const promptsContent = await fs.readFile(PROMPTS_FILE, 'utf-8');
        let prompts = JSON.parse(promptsContent);
        
        const planContent = await fs.readFile(PLAN_FILE, 'utf-8');
        const plan = JSON.parse(planContent);

        console.log(`📦 Loaded ${prompts.length} prompts.`);
        console.log(`📋 Loaded Audit Plan with ${plan.issues.length} issues.`);

        let deletedCount = 0;
        let mergedCount = 0;

        // 2. Execute Plan
        const idsToRemove = new Set<string>();

        // First Pass: Collect IDs to remove
        for (const issue of plan.issues) {
            if (issue.action === 'DELETE') {
                issue.targetIds.forEach((id: string) => idsToRemove.add(id));
            } else if (issue.action === 'MERGE') {
                if (issue.mergeTargetId) {
                    // Remove all targets EXCEPT the mergeTargetId
                    issue.targetIds.forEach((id: string) => {
                        if (id !== issue.mergeTargetId) idsToRemove.add(id);
                    });
                }
            }
        }

        // 3. Apply Changes
        const initialCount = prompts.length;
        prompts = prompts.filter((p: any) => !idsToRemove.has(p.id));
        const finalCount = prompts.length;

        deletedCount = initialCount - finalCount;

        // 4. Save
        console.log(`✨ Applied Changes:`);
        console.log(`   - Deleted/Merged: ${deletedCount} items`);
        console.log(`   - Remaining: ${finalCount} items`);

        if (deletedCount > 0) {
            // Backup first (just in case, overwriting locally)
            await fs.writeFile(`${PROMPTS_FILE}.bak`, promptsContent);
            
            await fs.writeFile(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
            console.log(`✅ Successfully updated ${PROMPTS_FILE}`);
            
            // Clean up plan (it's consumed)
            await fs.unlink(PLAN_FILE);
            console.log(`🗑️ Consumed and deleted ${PLAN_FILE}`);
        } else {
            console.log("⚠️ No changes were necessary.");
        }

    } catch (error: any) {
        console.error("❌ Failed to apply audit:", error.message);
    }
}

main();
