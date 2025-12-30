# 项目看板 (Project Kanban)

> **当前版本**: v0.2.0 (MVP) | **最后更新**: 2025-12-30 | **数据量**: 1,144 prompts

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

## 🟣 第四阶段：Post-MVP 优化 (规划中 v0.3.0)

### 体验增强
- [ ] **动态 OG 图片**: 为分享链接生成包含 Prompt 标题的预览图 ()
- [ ] **标签分类树**: 整理 Tag Taxonomy (如: 编程 > Python, 写作 > 邮件)，目前标签较乱
- [ ] **暗黑/明亮模式切换**: 目前强制暗黑，可以考虑支持系统主题

### 数据扩展
- [ ] **Google Gallery 爬虫**: 攻克 Playwright Persistent Context 问题，获取官方高质量数据
- [ ] **每日更新流**: 配置 GitHub Actions 每天运行爬虫和清洗

### 社区功能
- [ ] **点赞/收藏**: 需要接入 Supabase 或 Vercel KV 存储用户状态
- [ ] **多语言**: i18n 支持 (中文/英文)

---

## 📊 数据统计 (2025-12-30)

| 来源 | 数量 | 产出率 | 质量 |
|------|------|--------|------|
| Reddit | 853 | 97% | 高 |
| UserSubmission | 256 | - | 中 |
| X/Twitter | 26 | 7% | 精选 |
| GitHub | 9 | 100% | 不稳定 |

**总计**: **1,144** 条高质量 Prompt (Text: 872, Image: 272)
