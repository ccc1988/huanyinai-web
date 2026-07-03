# 寰引智能科技官网

面向企业的 AI 转型落地服务商官网，基于 Next.js + Tailwind CSS 构建。

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js (App Router) |
| 样式 | Tailwind CSS 4 (CSS-first `@theme`) |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 字体 | Space Grotesk + DM Sans (next/font) |
| 部署 | Vercel |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

开发服务器运行在 http://localhost:3000

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 全局布局（导航栏 + 页脚 + JSON-LD）
│   ├── page.tsx            # 首页（9 个区块）
│   ├── solutions/[industry]/  # 6 个行业方案页
│   ├── cases/[slug]/       # 3 个案例详情页
│   ├── about/              # 关于我们
│   ├── contact/            # 联系我们
│   ├── blog/               # 博客列表 + 详情
│   ├── api/contact/        # 联系表单 API
│   ├── sitemap.ts          # 自动生成 sitemap.xml
│   ├── robots.ts           # 自动生成 robots.txt
│   └── globals.css         # 全局样式 + Tailwind @theme
├── components/
│   ├── ui/                 # 通用组件（导航栏、页脚、Logo 等）
│   ├── home/               # 首页组件（Hero、能力矩阵等）
│   └── shared/             # 跨页面共享组件（表单、卡片）
├── lib/
│   ├── data.ts             # 集中数据管理（唯一数据源）
│   ├── seo.ts              # SEO metadata 工具
│   └── geo.ts              # GEO 结构化数据生成
└── public/
    └── llms.txt            # AI 模型可读文件（GEO）
```

## 可替换配置

以下内容集中在 `lib/data.ts` 的 `company` 对象中，替换后全站自动更新：

| 配置项 | 当前值 | 说明 |
|--------|--------|------|
| 官网域名 | `https://www.huanyin.ai` | 用于 metadata、canonical、sitemap |
| 微信号 | `huanyin-ai` | 首页 CTA、联系页、页脚 |
| 邮箱 | `contact@huanyin.ai` | 联系页、页脚、结构化数据 |
| 电话 | `待填写` | 联系页、页脚 |
| Logo | 文字 Logo + Lucide 图标 | `components/ui/Logo.tsx` |

### 外部表单通知

设置环境变量 `CONTACT_WEBHOOK_URL` 可将联系表单提交转发到外部服务（飞书、企业微信等）：

```bash
# .env.local
CONTACT_WEBHOOK_URL=https://hooks.example.com/your-webhook
```

未配置时，表单提交会在服务端记录日志并返回成功响应。

## 页面清单

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 9 个区块全部实现 |
| 报关行业 | `/solutions/customs` | 痛点/方案/案例/FAQ |
| 跨境物流 | `/solutions/cross-border-logistics` | |
| 跨境电商 | `/solutions/cross-border-ecommerce` | |
| 制造外贸 | `/solutions/manufacturing` | |
| 供应链 | `/solutions/supply-chain` | |
| 电商客服 | `/solutions/ecommerce-service` | |
| 案例1 | `/cases/customs-document-ai` | 报关文件 AI |
| 案例2 | `/cases/ecommerce-ai-production` | 跨境商品 AI |
| 案例3 | `/cases/logistics-tracking-ai` | 物流轨迹追踪 |
| 关于我们 | `/about` | |
| 联系我们 | `/contact` | 含交互式表单 |
| 博客列表 | `/blog` | |
| 博客详情 | `/blog/[slug]` | 3 篇 AI 落地实践 |

## SEO/GEO

- `sitemap.xml` — 自动生成，包含所有页面
- `robots.txt` — 允许全部爬取
- `llms.txt` — AI 模型可读的公司描述文件
- JSON-LD — Organization、Service、CaseStudy、FAQPage、BlogPosting

## 部署到 Vercel

```bash
npm install -g vercel
vercel deploy --prod
```

## License

© 寰引智能科技（深圳）有限公司
