# Changelog

本项目所有重要变更记录于此文件。

## v1.4.0 — 2026-07-05

### 新功能
- **案例总览页**：新增 `/cases` 路由，11 个案例按 6 大行业分组展示（卡片网格 + 统计条）
- **Footer 案例列**：Footer 新增客户案例列（5 个案例链接 + 查看全部），布局从 3 列改为 4 列
- **全部案例详情页开放**：去掉 `hasDetailPage` 限制，11 个案例均可访问详情页
- **CaseCard 统一交互**：所有卡片统一显示了解更多链接 + 关联客户名
- **神经场背景组件**：新增 NeuralBackground 动态背景组件

### 架构变更
- 数据链路扩展：`layout.tsx` → `AppShell.tsx` → `Footer.tsx` 新增 `cases` 数据透传
- `generateStaticParams` 返回全部案例（不再过滤 hasDetailPage）

### Bug 修复
- 修复 DATA_DIR `shared-data/settings.json` 导航链接未同步更新导致案例链接指向旧路径
- 修复导航栏案例链接指向单个详情页的问题

## v1.3.0 — 2026-07-05

### 新功能
- **解决方案总览页**：新增 `/solutions` 路由，6 大行业方案以卡片网格展示（图标 + 痛点 + 方案摘要 + 关联案例数），点击进入各行业详情页
- **Footer 解决方案列动态化**：从硬编码 4 个链接改为动态读取 industries.json 全部行业（过滤电商客服），新增"查看全部"入口
- **导航链接修正**：Navbar 和面包屑"解决方案"指向 `/solutions` 总览页（原指向 `/solutions/customs` 单页）

### 架构变更
- **数据链路扩展**：`layout.tsx` → `AppShell.tsx` → `Footer.tsx` 新增 `industries` 数据透传
- **Footer 组件接口**：新增 `industries: IndustrySolution[]` prop，替代硬编码链接

## v1.2.0 — 2026-07-05

### 新功能
- **联系人二维码管理**：后台可上传维护商务经理二维码（支持多人），Footer 和联系页动态渲染
- **Footer 品牌区升级**：Logo + 公司全称 + 定位描述 + 核心数据信任背书（企业客户/落地系统/行业覆盖/人效提升）+ 地理位置
- **Logo 云动画**：客户 Logo 墙增加 Framer Motion 动画效果
- **Cookie 安全修复**：生产环境 Cookie secure 标志自动判断

### 架构变更
- **数据持久化**：新增 `DATA_DIR` 环境变量，数据目录与 release 目录解耦，后台修改不再因部署丢失
- **数据动态读取**：`data.ts` 改为函数导出模式（`getCompany()` 等），消除模块级缓存，后台修改即时生效
- **Metadata 动态化**：SEO 元数据从 `settings.json` 运行时读取
- **标准化部署脚本**：新增 `deploy.sh`，集成 build + release + DATA_DIR + PM2 重启

### Bug 修复
- 修复后台修改数据后被下次部署覆盖的问题（release 目录数据来自 git 源码旧值）
- 修复 metadata 页签标题不从后台 settings 读取的问题
- 修复生产环境 Cookie secure 标志误判导致登录失败的问题

## v1.1.0 — 2026-07-04

### UI/UX 增强
- 新增 `favicon.svg` 和 OG 分享图（`public/og/default.svg`）
- 客户 Logo 墙重构：品牌风格图标卡片替代纯文字
- 案例卡片增加 SVG 可视化插画头部（`CaseIllustration` 组件，8 种 pattern）
- 行业方案页增加流程图示和行业图标
- 案例详情页增加解决方案架构图
- 首页 Hero 增加浮动光球视觉深度（Framer Motion 6s/8s 循环）
- 行业 Tab 增加行业图标和胶囊选中态

### 管理员后台系统（新增）
- **数据层**：8 个 JSON 文件（`data/*.json`）从代码中解耦，`lib/dataStore.ts` 读写
- **认证**：密码登录 + HMAC 签名 session（7天有效），`middleware.ts` 路由保护
- **案例管理**：列表/搜索/新增/编辑/删除，全字段编辑
- **博客管理**：列表/搜索/新增/编辑/删除，分段落编辑
- **行业方案管理**：列表/搜索/新增/编辑/删除，FAQ 编辑
- **公司信息管理**：基本信息/数据指标/客户列表增删改
- **站点设置管理**：SEO 标题/描述/关键词、OG 社交分享、GEO llms.txt、导航菜单
- **API 路由**：`/api/admin/{cases,blog,industries,company,settings}` + `/api/auth/{login,logout}`
- **AppShell**：管理后台页面隔离前台 Navbar/Footer

### 配置变更
- 开发端口从 `3000` 改为 **`18500**
- 新增 `.env.local` 管理员密码和 Session 密钥配置
- 新增 `turbopack.root` 配置消除构建警告

### Bug 修复
- 修复 `lib/data.ts` 重复的硬编码数据（JSON 导入与旧数据共存）
- 修复 `lib/auth.ts` `timingSafeEqual` 密码长度不一致时崩溃
- 修复 `middleware.ts` Edge Runtime 不兼容 Node.js `crypto` 模块

### 构建
- 35/35 路由全部生成（前台 21 + 管理后台 7 + API 7）

---

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
