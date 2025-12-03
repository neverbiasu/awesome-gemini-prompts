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
- [ ] **分页优化**: 增加 "跳转到页码" 功能。
- [x] **Run in AI Studio**: 实现 URL 参数自动填充 (Deep Integration)。

## 🔵 第三阶段：自动化与数据治理 (进行中)
- [x] **Google Gallery 爬虫 (核心)**: 
    - [x] 实现 Playwright Persistent Context 技术，绕过登录墙。
    - [x] 目标: 全自动抓取详情页 System Instructions。
- [ ] **Google Blog 深度爬虫**:
    - [ ] 抓取官方技术博客，挖掘 "Hidden Gems" (技巧与参数)。
- [ ] **数据质量防火墙**:
    - [ ] **严厉过滤**: 剔除所有 ChatGPT/Claude 相关内容。
    - [ ] **标签白名单**: 建立 Tag Taxonomy (<100 tags)。
- [ ] **MVP 数据目标**:
    - [ ] 总量 > 1000 条。
    - [ ] 官方来源 > 100 条。

## 🟣 第四阶段：部署与优化 (已完成)
- [x] **部署上线**: Vercel 工作流 (Preview & Production) 配置完成。
- [x] **CI/CD**: 自动化抓取与部署流水线。
- [x] **SEO 优化**: Meta 标签, Robots.txt, Sitemap.xml。
- [x] **性能优化**: Vercel Speed Insights, 字体优化 (LCP), 包体积优化 (ES2022)。
- [x] **Open in AI Studio**: 基础跳转功能 (待升级为自动填充)。

## ⚪ 第五阶段：高级功能 (计划中 / Post-MVP)
- [ ] **开发者模式**: 提供 "Copy as JSON" 按钮。
- [ ] **质量徽章**: "官方认证"、"社区精选"、"Awesome 认证"。
- [ ] **动态 OG 图片**: 为每个 Prompt 生成社交分享预览图。
- [ ] **社区提交**: 添加 "Submit Prompt" 按钮链接到 GitHub Issues/PRs。
- [ ] **数据分析看板**: 内部使用的 Prompt 使用情况统计。
