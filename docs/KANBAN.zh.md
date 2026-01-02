# 项目看板 (Project Kanban)

> **当前版本**: v0.2.0 (Release Ready) | **最后更新**: 2026-01-02 | **数据量**: 1,144 prompts

## 🚀 Product Hunt Launch 冲刺 (Completed)
**状态**: ✅ 所有关键路径已完成，随时可发布。

- [x] **Legal Compliance**: 添加 Privacy Policy 和 Terms of Service 页面。
- [x] **UX Polish**: 修复 Featured Prompts, 简化 Navbar, 修复 Image Prompt 分类。
- [x] **SEO**: 动态 OG Image 生成器上线。
- [x] **移动端适配**: 验证通过。

## 🌍 Marketing & Launch (正在进行)
- [ ] **Release**: Push to Vercel Production.
- [ ] **Post**: Product Hunt, Hacker News, Reddit.

## 💎 第四阶段：Hub 2.0 & 用户系统 (Planning)
**目标**: 提升数据筛选能力，引入用户账户体系。

- [ ] **高级筛选器 (Filters)**:
    - [ ] 侧边栏多选 (Model, Modality, Tag)
    - [ ] URL 参数同步 (`?tags=coding&model=gemini-3`)
- [ ] **用户系统 (Supabase)**:
    - [ ] GitHub Login
    - [ ] 收藏/点赞功能 (Like Button)
- [ ] **AI 集成**:
    - [ ] Prompt Refiner (一键优化提示词)

## 🔵 第三阶段：自动化与数据治理 (Completed)
- [x] **API Key 保护**: 依赖 .env 环境变量。
- [x] **数据清洗**: Qwen + Gemini 双引擎。

## 🟣 Backlog
- [ ] **Open Core 架构**: 迁移 Scraper 脚本至私有仓库。
- [ ] **每日更新流**: GitHub Actions Cron Job。
- [ ] **Google Gallery 爬虫**: Playwright 攻坚。
