---
description: Feature development workflow for awesome-gemini-prompts
---

# Feature Development SOP

This workflow covers the standard process for adding features or fixing issues in the awesome-gemini-prompts project.

## Phase 1: Analysis & Planning

1. **Understand the requirement**
   - Review user request and context
   - Check relevant existing code (`view_file`, `grep_search`)
   - Identify affected files and dependencies

2. **Update KANBAN**
   - Add task to appropriate phase in `docs/KANBAN.md` and `docs/KANBAN.zh.md`
   - Mark as `[ ]` (in progress)

## Phase 2: Implementation

3. **Make code changes**
   - Edit files using `replace_file_content` or `multi_replace_file_content`
   - For new files, use `write_to_file`
   - Follow existing code patterns and conventions

4. **Validate changes**
   - Run TypeScript check: `npx tsc <file> --noEmit --esModuleInterop --skipLibCheck`
   - Fix any lint errors immediately

## Phase 3: Testing

5. **Run functional tests**
   - For scrapers: `npm run scrape` or specific scraper
   - For cleaner: `npm run clean:ingest`
   - For audit: `npm run clean:audit`
   - Check output for errors

6. **Generate reports**
   - Run `npm run report` to verify data integrity
   - Review statistics and yield rates

## Phase 4: Commit & Push

7. **Stage relevant files only**
   ```bash
   git add <specific-files>
   ```
   - DO NOT use `git add -A` blindly
   - Exclude test files, backup files, and temporary files

8. **Commit with conventional format**
   ```bash
   git commit -m "type(scope): description"
   ```
   Types: `fix`, `feat`, `docs`, `chore`, `refactor`

9. **Sync and push**
   ```bash
   git pull origin master --rebase
   git push origin master
   ```
   - If conflicts, stash changes first: `git stash && git pull --rebase && git stash pop`

## Phase 5: Documentation

10. **Update KANBAN**
    - Mark completed tasks as `[x]`
    - Update current data counts if relevant

11. **Archive reports (if applicable)**
    - Reports auto-save to `docs/reports/`
    - Audit plans save to `data/audit_plan.json`

## File Categories

| Category | Should Commit | Examples |
|----------|---------------|----------|
| Source code | ✅ Yes | `src/**/*.ts` |
| Scraped data | ✅ Yes | `data/reddit.json`, `data/github.json`, `data/x.json` |
| Production data | ✅ Yes | `data/prompts.json` |
| Config files | ✅ Yes | `.gitignore`, `package.json` |
| Reports | ⚠️ Optional | `docs/reports/*.md` |
| Backup files | ❌ No | `*.bak` |
| Temp/working files | ❌ No | `audit_plan.json` |
| Test scripts | ❌ No | `test-*.ts` |

## Key Commands Reference

```bash
# Scraping
npm run scrape          # Full scrape (Reddit + GitHub + Web)
npm run scrape:reddit   # Reddit only
npm run scrape:x        # Twitter/X only (Playwright)

# Cleaning
npm run clean:ingest    # Run LLM cleaner on raw data

# Auditing
npm run clean:audit     # Generate audit report
npm run audit:apply     # Apply audit changes

# Reporting
npm run report          # Generate summary report

# Development
bun run dev             # Start Next.js dev server
```
