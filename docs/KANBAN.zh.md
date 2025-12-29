# 项目看板 (Project Kanban)

> **最后更新**: 2025-12-29 | **数据量**: 629+ prompts

## 🟢 第一阶段：基础建设 (已完成)
- [x] **项目初始化**: Next.js 14, TailwindCSS, HeroUI 环境搭建
- [x] **数据架构**: Schema 2.0 (Zod)，含 Modality 字段
- [x] **基础 UI**: 网格布局 + 主题支持

## 🟡 第二阶段：UI/UX 深度优化 (已完成)
- [x] **导航栏**: Krea.ai 风格磨砂玻璃设计
- [x] **Card UI 3.0**: 视觉升级、标签横向滚动
- [x] **分页优化**: 跳转到页码功能
- [x] **Run in AI Studio**: URL 参数自动填充

## 🔵 第三阶段：自动化与数据治理 (进行中)

### 数据爬虫 ✅
| 爬虫 | 命令 | 状态 |
|------|------|------|
| Reddit | `npm run scrape:reddit` | ✅ 503 条 |
| GitHub | `npm run scrape` | ✅ 8 条 |
| X (Playwright) | `npm run scrape:x` | ⚠️ 已弃用 |
| **X (FxTwitter)** | `npm run scrape:x:fast` | ✅ 种子模式 |
| **X (自动发现)** | `npm run scrape:x:discover` | ✅ 348 条 |

### 已完成 ✅
- [x] **X 爬虫重构**: 
    - 基于 FxTwitter API，无需 Playwright
    - Google Custom Search 自动发现推文
    - 发现 MKBHD、Justine Moore 等 KOL 内容
- [x] **数据清洗**: 移除所有 test 测试数据
- [x] **ID 稳定性**: 确定性 MD5 哈希
- [x] **时间戳优化**: 保留原始 createdAt
- [x] **审计脚本**: 重写使用 @google/generative-ai
- [x] **开发 SOP**: `.agent/workflows/feature-development.md`
- [x] **Preview 通知**: 已关闭 PR 评论

### 待办 📋
- [ ] **过滤优化**: X 爬虫增加 likes > 10 过滤
- [ ] **Google Gallery 爬虫**: Playwright Persistent Context
- [ ] **标签白名单**: Tag Taxonomy (<100 tags)
- [ ] **ChatGPT/Claude 过滤**: 剔除非 Gemini 内容
- [ ] **MVP 数据目标**: 总量 > 1000 条

## 🟣 第四阶段：部署与优化 (已完成)
- [x] **Vercel 部署**: Preview & Production 工作流
- [x] **CI/CD**: 自动化抓取与部署
- [x] **SEO/性能/安全**: 全部优化完成

## ⚪ 第五阶段：高级功能 (Post-MVP)
- [ ] **开发者模式**: Copy as JSON
- [ ] **质量徽章**: 官方认证、社区精选
- [ ] **动态 OG 图片**
- [ ] **社区提交**: Submit Prompt 按钮

---

## 📊 数据统计

| 来源 | 原始数据 | 入库 | 产出率 |
|------|----------|------|--------|
| Reddit | 875 | 503 | 57% |
| X/Twitter | 348 | 38+ | 12%→↑ |
| GitHub | 8 | 8 | 100% |

**总计**: 629+ 条高质量 Prompt
