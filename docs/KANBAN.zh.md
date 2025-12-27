# 项目看板 (Project Kanban)

## 🟢 第一阶段：基础建设 (已完成)
- [x] **项目初始化**: Next.js 14, TailwindCSS, HeroUI 环境搭建。
- [x] **数据架构**: 定义 Schema 2.0 (Zod)，包含模态 (Modality) 字段。
- [x] **模拟数据**: 创建用于测试的真实种子数据。
- [x] **基础 UI**: 实现基础网格布局和主题支持。

## 🟡 第二阶段：UI/UX 深度优化 (v1.2 重启)
- [x] **导航栏重构**: 
    - [x] 采用 Krea.ai 风格悬浮磨砂玻璃设计。
    - [x] 核心分类: Text / Image / Video / Audio。
    - [x] 图标规范化: 修复 Reddit/GitHub 图标。
- [x] **Card UI 3.0**:
    - [x] 视觉升级: 提升留白与排版质感。
    - [x] Bug 修复: 解决模型名称截断导致的 Tooltip 重叠问题。
    - [x] **标签优化**: 支持横向滚动，展示所有标签。
    - [x] **极简 UI**: 仅图标的 "Run" 按钮。
- [x] **视觉增强**: 实现 Before/After 图片对比滑块 (CompareSlider) 用于 Image-to-Image 效果展示。
- [x] **分页优化**: 增加 "跳转到页码" 功能。
- [x] **Run in AI Studio**: 实现 URL 参数自动填充 (Deep Integration)。

## 🔵 第三阶段：自动化与数据治理 (进行中)
- [ ] **Google Gallery 爬虫 (核心)**: 
    - [ ] 实现 Playwright Persistent Context 技术，绕过登录墙。
    - [ ] 目标: 全自动抓取详情页 System Instructions。
- [ ] **博客与社媒数据提取**:
    - [ ] **技术博客**: 抓取 Google/Medium 博客中的 "Hidden Gems" 与工程模式。
    - [x] **社交媒体**: 已实现 `scraper-playwright.ts` (Playwright Guest 模式，支持混合搜索与 Timeline 抓取)。
    - [x] **X (Twitter) 深度优化**:
        - [x] **多媒体支持**: 提取推文中的图片/视频 (目前仅纯文本)。
        - [x] **Thread 支持**: 自动展开并抓取完整的推文串 (Thread) 以获取完整上下文。
        - [x] **健壮性**: 增加网络波动重试机制与更智能的去重策略。
    - [x] **Reddit 优化**: 支持图文贴 (Gallery) 与多模态提取。
- [x] **竞品分析**: 
    - [ ] `promptlibrary.space` 分析 (优先级低 -> 暂缓)。
    - [x] Github 仓库 (`awesome-nano-banana-pro-prompts`) 数据结构分析与Issue爬取实现。
- [ ] **Vertex AI 官方库集成**:
    - [ ] 录入官方结构化 Prompt (Extract, Code, Classify)。
- [x] **数据质量防火墙**:
    - [x] **LLM 清洗升级**: 切换至 Gemini 2.5 Flash API (移除不稳定的 GitHub Models/ModelScope)。
    - [x] **安全检查**: 防止清洗过程数据丢失。
    - [x] **数据去重**: 防止重复导入现有 Prompt 的逻辑。
    - [x] **产出率救援**: 优化 Batch Size 与 Context，将产出率从 37% 提升至 49%。
    - [x] **可观测性**: 实现每日爬虫报告自动归档 (`docs/reports/`) 与 废弃日志 (`docs/rejected/`)。
    - [x] **ID 稳定性**: 修复所有爬虫的 ID 漂移问题，使用基于 URL 的确定性 MD5 哈希。
    - [ ] **严厉过滤**: 剔除所有 ChatGPT/Claude 相关内容。
    - [ ] **标签白名单**: 建立 Tag Taxonomy (<100 tags)。
- [ ] **MVP 数据目标**:
    - [ ] 总量 > 1000 条 (当前: 634)。
    - [x] 官方来源 > 100 条 (Google Gallery + 官方推特账号)。

## 🟣 第四阶段：部署与优化 (已完成)
- [x] **部署上线**: Vercel 工作流 (Preview & Production) 配置完成。
- [x] **CI/CD**: 自动化抓取与部署流水线。
- [x] **SEO 优化**: Meta 标签, Robots.txt, Sitemap.xml。
- [x] **性能优化**: Vercel Speed Insights, 字体优化 (LCP), 包体积优化 (ES2022)。
- [x] **安全性**: 升级 Next.js 至 16.0.7 (修复 CVE-2025-66478)。
- [x] **文档**: 自动化 UI 归档 (`npm run archive:ui`)。
- [x] **UI 迁移**: 迁移至 @heroui/react (System/Button/Card/Chip/Tooltip)。
- [x] **兼容性修复**: 解决 Next.js 16 / React 19 构建 (Barrel imports) 与运行时 (Hydration) 问题。
- [x] **Open in AI Studio**: 基础跳转功能 (待升级为自动填充)。

## ⚪ 第五阶段：高级功能 (计划中 / Post-MVP)
- [ ] **开发者模式**: 提供 "Copy as JSON" 按钮。
- [ ] **质量徽章**: "官方认证"、"社区精选"、"Awesome 认证"。
- [ ] **动态 OG 图片**: 为每个 Prompt 生成社交分享预览图。
- [ ] **社区提交**: 添加 "Submit Prompt" 按钮链接到 GitHub Issues/PRs。
- [ ] **数据分析看板**: 内部使用的 Prompt 使用情况统计。
