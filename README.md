# 寰引智能科技官网

面向企业的 AI 转型落地服务商官网，基于 Next.js 16 + Tailwind CSS 4 构建。

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 16.2 (App Router, standalone build) |
| 样式 | Tailwind CSS 4 (CSS-first `@theme`) |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 字体 | Space Grotesk + DM Sans (next/font) |
| 部署 | PM2 + Nginx (standalone 模式) |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器 (端口 18500)
npm run dev

# 构建生产版本 (standalone)
npm run build

# 启动生产服务器
npm start
```

开发服务器运行在 http://localhost:18500

## 项目结构

```
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 全局布局（Navbar + Footer + JSON-LD）
│   ├── page.tsx            # 首页（9 个区块）
│   ├── admin/              # 管理后台（数据 CRUD）
│   ├── api/admin/          # 后台 API 路由
│   ├── api/auth/           # 认证 API（登录/登出）
│   ├── solutions/[industry]/  # 行业方案页
│   ├── cases/[slug]/       # 案例详情页
│   ├── about/              # 关于我们
│   ├── contact/            # 联系我们（含二维码）
│   ├── blog/               # 博客列表 + 详情
│   ├── sitemap.ts          # 自动生成 sitemap.xml
│   ├── robots.ts           # 自动生成 robots.txt
│   └── globals.css         # 全局样式 + Tailwind @theme
├── components/
│   ├── ui/                 # 通用组件（Navbar、Footer、Logo、AppShell）
│   ├── home/               # 首页组件（Hero、能力矩阵等）
│   ├── shared/             # 跨页面共享组件
│   └── admin/              # 后台管理共享组件
├── lib/
│   ├── data.ts             # 集中数据管理（函数导出，运行时读取）
│   ├── dataStore.ts        # 后台数据读写（JSON 文件 CRUD）
│   ├── auth.ts             # 认证逻辑（HMAC session）
│   ├── seo.ts              # SEO metadata 工具
│   └── geo.ts              # GEO 结构化数据生成
├── data/                   # JSON 数据文件（后台可编辑）
│   ├── company.json        # 公司信息
│   ├── contacts.json       # 联系人二维码
│   ├── cases.json          # 案例数据
│   ├── settings.json       # SEO/站点设置
│   └── ...                 # 其他数据文件
├── middleware.ts            # 后台路由保护
└── public/
    └── llms.txt            # AI 模型可读文件（GEO）
```

## 数据管理

所有业务数据存储在 `data/*.json` 中，通过 `lib/data.ts` 运行时动态读取：

- **前台**：`getCompany()`, `getContacts()`, `getCases()` 等函数读取 JSON
- **后台**：`lib/dataStore.ts` 提供 `readData` / `writeData` 读写 JSON
- **环境变量 `DATA_DIR`**：生产环境指定持久化数据目录，与 release 目录解耦

### 联系人二维码

后台 `/admin/company` 可维护商务经理信息（姓名、电话、微信、二维码图片），
Footer 和联系页自动动态渲染。

## 管理后台

访问 `/admin/login` 进入管理后台（需密码登录），可管理：

- 公司信息、联系人二维码
- 案例库（增删改查）
- 博客文章
- 行业方案
- 客户列表
- 站点设置（SEO、OG、导航菜单）

## 生产部署

```bash
# 标准化部署（在服务器上执行）
bash /var/www/huanyin_web/deploy.sh

# deploy.sh 自动完成：
# 1. npm run build
# 2. 创建新 release 目录，复制 standalone 产物
# 3. 切换 current 软链接
# 4. PM2 重启（带 DATA_DIR 环境变量）
```

### 环境变量

| 变量 | 说明 |
|------|------|
| `ADMIN_PASSWORD` | 管理后台密码 |
| `SESSION_SECRET` | Session 签名密钥 |
| `DATA_DIR` | 持久化数据目录（生产环境） |
| `CONTACT_WEBHOOK_URL` | 联系表单转发地址（可选） |

## 页面清单

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 9 个区块 |
| 行业方案 | `/solutions/[industry]` | 4 个行业 |
| 案例详情 | `/cases/[slug]` | 3 个案例 |
| 关于我们 | `/about` | |
| 联系我们 | `/contact` | 含表单 + 二维码 |
| 博客 | `/blog` | 列表 + 详情 |
| 管理后台 | `/admin` | 数据管理 |

## SEO/GEO

- `sitemap.xml` / `robots.txt` — 自动生成
- `llms.txt` — AI 模型可读文件
- JSON-LD — Organization、Service、CaseStudy、FAQPage、BlogPosting
- Metadata 从 `settings.json` 运行时动态读取

## License

© 寰引智能科技（深圳）有限公司
