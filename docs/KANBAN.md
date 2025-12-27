# Project Kanban Board

## 🟢 Phase 1: Foundation (Completed)
- [x] **Project Setup**: Initialize Next.js 14, TailwindCSS, HeroUI.
- [x] **Data Architecture**: Define Schema 2.0 (Zod), Modality fields.
- [x] **Mock Data**: Create realistic seed data for testing.
- [x] **Basic UI**: Implement basic Grid layout and Theme provider.

## 🟡 Phase 2: UI/UX Deep Optimization (v1.2 Reopened)
- [x] **Navigation Refactor**: 
    - [x] Krea.ai style floating glassmorphism design.
    - [x] Core Categories: Text / Image / Video / Audio.
    - [x] Icon Standardization: Fix Reddit/GitHub icons.
- [x] **Card UI 3.0**:
    - [x] Visual Upgrade: Improved whitespace and typography.
    - [x] Bug Fix: Resolve truncated model name tooltip overlap.
    - [x] **Tag Visibility**: Horizontal scroll for unlimited tags.
    - [x] **Clean UI**: Icon-only "Run" button.
- [x] **Pagination**: Add "Jump to Page" functionality.
- [x] **Run in AI Studio**: Implement URL parameter auto-fill (Deep Integration).

## 🔵 Phase 3: Automation & Data Governance (In Progress)
- [ ] **Google Gallery Scraper (Core)**: 
    - [ ] Implement Playwright Persistent Context to bypass login wall.
    - [ ] Goal: Fully automated detail page scraping.
- [ ] **Blog & Social Media Extraction**:
    - [ ] **Tech Blogs**: Scrape Google/Medium blogs for "Hidden Gems" & Engineering patterns.
    - [x] **Social Media**: Implemented `scraper-playwright.ts` (Playwright Guest Mode with Hybrid Search & Timeline scraping).
    - [x] **X (Twitter) Deep Optimization**:
        - [x] **Media Support**: Extract images/videos from tweets.
        - [x] **Thread Support**: Automatically expand and scrape full threads for context.
        - [x] **Robustness**: Add retry mechanisms and smarter deduplication.
    - [x] **Reddit Optimization**: Gallery support and multimodal extraction.
- [ ] **Vertex AI Gallery Integration**:
    - [ ] Ingest official structured prompts (Extract, Code, Classify).
- [x] **Data Quality Firewall**:
    - [x] **LLM Cleaner Upgrade**: Switched to Gemini 2.5 Flash API (removed unstable GitHub Models/ModelScope).
    - [x] **Safety Checks**: Prevent data loss during cleaning.
    - [x] **Deduplication**: Logic to prevent re-importing existing prompts.
    - [x] **Observability**: Daily scraping reports archived to `docs/reports/` and rejection logs to `docs/rejected/`.
    - [x] **ID Stability**: Fixed ID drift in all scrapers using deterministic MD5 hashing based on URLs.
    - [ ] **Strict Filtering**: Remove all ChatGPT/Claude related content.
    - [ ] **Tag Whitelist**: Establish Tag Taxonomy (<100 tags).
- [ ] **MVP Data Targets**:
    - [ ] Total > 1000 Prompts (Current: 634).
    - [x] Official Sources > 100 Prompts (Google Gallery + Official Twitter Accounts).

## 🟣 Phase 4: Deployment & Optimization (Completed)
- [x] **Deployment**: Vercel workflows (Preview & Production) configured.
- [x] **CI/CD**: Automated scraping and deployment pipelines.
- [x] **SEO**: Meta tags, Robots.txt, Sitemap.xml.
- [x] **Performance**: Vercel Speed Insights, Font Optimization (LCP), Bundle Size (ES2022).
- [x] **Security**: Update Next.js to 16.0.7 (Fix CVE-2025-66478).
- [x] **Documentation**: Automated UI Archiving (`npm run archive:ui`).
- [x] **UI Migration**: Migrated to @heroui/react (System/Button/Card/Chip/Tooltip).
- [x] **Compatibility Fixes**: Resolved Next.js 16 / React 19 build (Barrel imports) and runtime (Hydration) issues.
- [x] **Open in AI Studio**: Basic redirect (upgraded to auto-fill).

## ⚪ Phase 5: Advanced Features (Planned / Post-MVP)
- [ ] **Developer Mode**: "Copy as JSON" button for API integration.
- [ ] **Quality Badges**: "Official", "Community Choice", "Awesome Certified".
- [ ] **Dynamic OG Images**: Generate social preview images.
- [ ] **Community Submission**: Add "Submit Prompt" button linking to GitHub Issues/PRs.
- [ ] **Analytics Dashboard**: Internal view for prompt usage stats.
