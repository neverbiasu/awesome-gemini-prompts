# 项目看板 (Project Kanban)

> **当前版本**: v0.2.0 (MVP) | **最后更新**: 2025-12-31 | **数据量**: 1,144 prompts

## 🚀 Product Hunt Launch 冲刺 (Pre-Launch)
**目标**: 提升分享转化率和第一印象，为 PH 发布做准备。

- [x] **动态 OG Image**: 使用 `@vercel/og` 为每个 Prompt 页面生成精美预览图。
- [x] **README 美化**: 添加 Banner图、功能列表、Tech Stack 徽章。
- [x] **Landing Page**: 极简高级黑白风，含 Featured Prompts 演示。
- [ ] **移动端适配**: 最终真机验收。
- [ ] **数据埋点**: 集成 Google Analytics (GA4) 或 PostHog。

## 🌍 Marketing & Launch (宣发准备)
**目标**: 在 Product Hunt 拿到 Top 5，获取首批 1000 个 Star。

- [ ] **域名购买**: 购买 `.io` 或 `.dev` 域名。
- [ ] **Asset 制作**:
    - [ ] App 交互录屏 (Demo Video)
    - [ ] 5张高颜值截图 (Landing, Hub, Detail, Mobile)
    - [ ] Maker's Comment
- [ ] **Copywriting**: 为 Reddit (r/GoogleGemini) 和 HN 撰写文案。
- [ ] **Social**: Twitter 预热。

## 🟢 第一阶段：基础建设 (已完成)
- [x] **项目初始化**: Next.js 14, TailwindCSS, HeroUI 环境搭建
- [x] **数据架构**: Schema 2.0 (Zod)，含 Modality 字段
- [x] **基础 UI**: 网格布局 + 主题支持

## 🟡 第二阶段：UI/UX 深度优化 (已完成)
- [x] **导航栏**: 
    - 简化分类 (All/Text/Image)
    - 添加 "Submit" 和 "Guide" 入口
    - 快速获取 API Ket 链接
- [x] **Card UI 3.0**: 
    - 视觉升级、标签横向滚动
    - **Modality 标记**: 显性展示 Image/Text 图标
- [x] **分页优化**: 跳转到页码功能
- [x] **Run in AI Studio**: URL 参数自动填充
- [x] **About 页面**: 项目介绍与使用指南

## 🔵 第三阶段：自动化与数据治理 (v0.2.0 完成)

### 数据爬虫 ✅
| 爬虫 | 命令 | 状态 | 备注 |
|------|------|------|------|
| Reddit | `npm run scrape:reddit` | ✅ 853 条 | 产出率 97% |
| GitHub | `npm run scrape` | ✅ 9 条 | 产出率 113% |
| **X (Auto)** | `npm run scrape:x:discover` | ✅ 26 条 | Google Search |
| UserSubmission | `usersubmission` | ✅ 256 条 | ModelScope清洗 |

### 已完成 ✅
- [x] **X 爬虫重构**: 基于 Google Search + FxTwitter API，无需 Playwright
- [x] **数据清洗优化**:
    - **双引擎**: Gemini 配额用尽自动降级至 ModelScope (Qwen)
    - **Modality**: 自动为 1100+ 条数据补充 Image/Text 分类
- [x] **质量审计**: 
    - `npm run clean:audit` 基于 ModelScope 进行聚类分析
    - 自动发现并修复重复项 (Duplicates) 和低质量内容

## 🟣 Post-MVP / Backlog
- [ ] **标签分类树**: 整理 Tag Taxonomy (如: 编程 > Python)，目前标签较乱
- [ ] **Google Gallery 爬虫**: 攻克 Playwright Persistent Context
- [ ] **每日更新流**: GitHub Actions 定时任务
- [ ] **点赞/收藏**: 用户账户系统 (Supabase)
- [ ] **多语言**: i18n 支持

---

## 📊 数据统计 (2025-12-30)
**总计**: **1,144** 条高质量 Prompt (Text: 872, Image: 272)
