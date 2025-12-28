# 项目看板 (Project Kanban)

## 🟢 第一阶段：基础建设 (已完成)
- [x] **项目初始化**: Next.js 14, TailwindCSS, HeroUI 环境搭建。
- [x] **数据架构**: 定义 Schema 2.0 (Zod)，包含模态 (Modality) 字段。
- [x] **模拟数据**: 创建用于测试的真实种子数据。
- [x] **基础 UI**: 实现基础网格布局和主题支持。

## 🟡 第二阶段：UI/UX 深度优化 (已完成)
- [x] **导航栏重构**: Krea.ai 风格悬浮磨砂玻璃设计。
- [x] **Card UI 3.0**: 视觉升级、标签横向滚动、极简 Run 按钮。
- [x] **分页优化**: 增加 "跳转到页码" 功能。
- [x] **Run in AI Studio**: URL 参数自动填充。

## 🔵 第三阶段：自动化与数据治理 (进行中)

### 已完成 ✅
- [x] **Reddit 爬虫**: 支持 Gallery、多模态提取、User-Agent 修复
- [x] **X (Twitter) 爬虫**: Playwright Guest 模式、混合搜索
- [x] **GitHub 爬虫**: Issues 爬取、Notebook 解析
- [x] **LLM 清洗**: Gemini 2.5 Flash API、确定性 ID
- [x] **时间戳优化**: 保留原始 createdAt，正确设置 updatedAt
- [x] **开发流程 SOP**: `.agent/workflows/feature-development.md`
- [x] **审计脚本**: 重写使用 @google/generative-ai
- [x] **产出率**: 整体 52%+ (Reddit 57%, GitHub 31%)

### 进行中 🔄
- [ ] **Twitter 产出率优化**: 当前仅 12%，需调整 LLM prompt
- [ ] **LLM 过滤调优**: 减少误杀有价值的经验分享帖
- [ ] **Google Gallery 爬虫**: Playwright Persistent Context

### 待办 📋
- [ ] **新数据源**:
    - [ ] Google AI Blog 技术文章
    - [ ] HuggingFace 相关数据集
    - [ ] Discord 社区
- [ ] **标签白名单**: Tag Taxonomy (<100 tags)
- [ ] **ChatGPT/Claude 过滤**: 剔除非 Gemini 内容
- [ ] **MVP 数据目标**: 总量 > 1000 条 (当前: 629)

### 数据瓶颈分析 📊
| 问题 | 影响 | 优先级 |
|------|------|--------|
| LLM 过度过滤 | 丢失有价值经验帖 | 高 |
| Twitter 产出率低 (12%) | 损失 284 条潜在数据 | 高 |
| 数据源单一 (80% Reddit) | 内容多样性不足 | 中 |

## 🟣 第四阶段：部署与优化 (已完成)
- [x] **Vercel 部署**: Preview & Production 工作流
- [x] **CI/CD**: 自动化抓取与部署
- [x] **SEO/性能/安全**: 全部优化完成

## ⚪ 第五阶段：高级功能 (Post-MVP)
- [ ] **开发者模式**: Copy as JSON
- [ ] **质量徽章**: 官方认证、社区精选
- [ ] **动态 OG 图片**
- [ ] **社区提交**: Submit Prompt 按钮
