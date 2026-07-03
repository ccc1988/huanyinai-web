# Changelog

本项目所有重要变更记录于此文件。

## v1.0.0 — 2026-07-04

### 主要变更

#### 首页（9 个区块全部实现）
- 导航栏：悬浮毛玻璃效果，滚动增强模糊，移动端汉堡菜单
- Hero 全屏区：紫色径向光晕背景 + 细网格线 + Framer Motion 进场动画序列 + 客户 Logo 预览
- 客户 Logo 墙：10 家真实企业客户，hover 变亮效果
- 能力矩阵：4 卡片（AI 智能体 / AI 文档处理 / RPA 自动化 / 数据智能）
- 行业解决方案 Tab：6 个 Tab 切换，内容 300ms 淡入淡出
- 案例亮点：3 个核心案例卡片
- 数据指标墙：count-up 动画（滚动进入视口时触发）
- 最终 CTA：白底黑字按钮 + 微信引导
- 页脚：三栏布局 + 解决方案/公司/联系方式 + 版权信息

#### 行业方案页（6 个，SSG 预渲染）
- `/solutions/customs` — 报关行业 AI 解决方案
- `/solutions/cross-border-logistics` — 跨境物流 AI 解决方案
- `/solutions/cross-border-ecommerce` — 跨境电商 AI 解决方案
- `/solutions/manufacturing` — 制造与外贸 AI 解决方案
- `/solutions/supply-chain` — 供应链 AI 解决方案
- `/solutions/ecommerce-service` — 电商客服 AI 解决方案
- 每页包含：痛点、方案、关联案例引用、FAQ、Service/FAQPage JSON-LD

#### 案例详情页（3 个，SSG 预渲染）
- `/cases/customs-document-ai` — 报关文件 AI 智能处理系统
- `/cases/ecommerce-ai-production` — 跨境商品 AI 智能生产系统
- `/cases/logistics-tracking-ai` — AI 物流轨迹实时追踪与预警系统
- 每页包含：行业、痛点、方案、客户价值、数据指标、适用场景、CaseStudy JSON-LD

#### 其他页面
- 关于我们 `/about` — 公司定位、能力边界、行业覆盖、客户信任
- 联系我们 `/contact` — 联系方式 + 交互式咨询表单（前端校验 + 提交状态）
- 博客列表 `/blog` — 文章卡片列表 + 分类标签
- 博客详情 `/blog/[slug]`（3 篇）— 完整正文 + 关联阅读 + BlogPosting JSON-LD

#### API
- `/api/contact` — 联系表单后端，服务端校验 + Webhook 转发支持 + 结构化 JSON 响应

#### SEO / GEO
- `sitemap.xml` — 自动生成，包含全部 21 个页面
- `robots.txt` — 允许全部爬取，指向 sitemap
- `llms.txt` — AI 模型可读的公司描述文件（GEO 核心）
- JSON-LD 结构化数据：Organization、Service、CaseStudy、FAQPage、BlogPosting
- 每页独立 metadata（title / description / canonical / Open Graph）

#### 设计系统
- 深蓝灰暗色主题（`#0F1117` 主背景，`#1A1D27` 卡片层，`#0A0C12` 页脚）
- 配色铁律遵守：紫色 `#6366F1` 仅用于装饰，CTA 白底黑字最高对比
- 文字对比度：标题 17.2:1（AAA），正文 11.6:1（AAA），标签 6.4:1（AA+）
- 字体：Space Grotesk（标题）+ DM Sans（正文），next/font 自动优化零 CLS
- Tailwind CSS 4 CSS-first `@theme` 配置

#### 可访问性
- `prefers-reduced-motion` 全局支持（禁用所有动画）
- 语义化 HTML（nav/main/section/footer）
- `focus-visible` 焦点环 + `aria-*` 属性 + 表单 label 关联
- `role="alert"` 错误提示

### 技术栈
- Next.js 16（App Router）+ React 19
- Tailwind CSS 4（CSS-first `@theme`）
- Framer Motion（动画）
- Lucide React（图标）
- Google Fonts（Space Grotesk + DM Sans，next/font）

### 占位策略
- 域名：`https://www.huanyin.ai`
- 微信号：`huanyin-ai`
- 邮箱：`contact@huanyin.ai`
- 电话：`待填写`
- Logo：文字 Logo + Lucide Hexagon 图标占位
