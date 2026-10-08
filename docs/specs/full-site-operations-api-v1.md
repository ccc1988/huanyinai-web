# 全站代运营 API v1 增量规格

> 日期：2026-10-08（中国标准时间）
> 状态：已批准实施的云端分支规格；代码、部署、生产验收尚未完成
> 上位方案：`20261008-全站代运营API与授权管理后台方案.md` v0.2
> 追踪：W1-W6、FULL-01-FULL-10、ACC-01-ACC-10

## 1. 目标与边界

将官网从“页面读取 JSON、后台直接覆盖 JSON”升级为可审计、可回滚、可授权的全站运营服务。公开页面继续读取已发布快照；外部运营方只能通过 OAuth 2.0 client credentials + opaque bearer token 访问受治理资源。

本版本不开放 root/Git/任意文件写入/任意 HTML、CSS、JS 执行/数据库直连/管理员 Cookie/SMTP 凭据，不改变既有公开版默认内容、布局和营销数字。AIGEO 消费方只接收 API、OpenAPI 与适配样例；不在本分支声称已完成消费方真实接通。

## 2. 事实源与持久化

- 公开内容事实源：`DATA_DIR` 下的发布快照 JSON。
- 管理事实源：`DATA_DIR/operations.sqlite3`，使用 Node 22 `node:sqlite`，保存接入方、secret 元数据、token hash、草稿、修订、审核、回执、审计、幂等键、软删除和媒体元数据。
- SQLite 与 JSON 不宣称单一原子事务。发布顺序：SQLite intent（含 before/after hash）→ 临时 JSON → 原子 rename → SQLite committed；中断后恢复器继续或标记 `needs_recovery`，不能静默丢失。
- 测试必须传入独立 `DATA_DIR`/`MEDIA_DIR`，不得读写 `/var/www/huanyin_web/shared-data`。

## 3. 资源域与生命周期

资源集合：`blog-posts`、`cases`、`industries`、`company`、`customers`、`capabilities`、`stats`、`contacts`、`settings`、`pages`、`media`、`analytics`、`submissions`。

| 资源 | API/后台要求 | 保护规则 |
| --- | --- | --- |
| 文章、案例、行业方案 | 列表、详情、草稿、修订、提交、审核、发布、下线、软删、恢复、回滚 | 来源/审核；案例客户、指标、效果声明须 evidence |
| 企业资料、客户、能力、联系方式、统计 | 全字段纳入模型、排序与发布 | 品牌事实、联系方式、营销数字为保护字段 |
| 页面/区块 | 首页 Hero/介绍/CTA、关于、联系、列表标题、AI 搜索增长分节 | 仅白名单 block，不执行任意代码 |
| 站点/SEO | title、description、OG、导航、canonical、索引规则、sitemap/llms 输入 | 核心域名、robots/noindex、法律声明须所有者批准 |
| 媒体 | 上传、查询、替换、alt、关联、软删/恢复 | MIME/魔数/大小/尺寸校验；禁止脚本和远程抓取 |
| analytics/submissions | 聚合运营数据；线索独立 scope | 不承诺索引/AI 引用/增长；线索默认关闭 |

内容状态统一为：`draft -> submitted -> approved -> published -> unpublished -> archived`。删除默认软删除；每次操作都生成回执、审计和修订。

## 4. 机器授权

`POST /api/integrations/v1/oauth/token` 接受 `grant_type=client_credentials`、`client_id`、`client_secret` 和可选 scope。服务端只保存 token SHA-256 hash、指纹、签发/过期/撤销时间，绝不保存明文 token。

- Access Token 默认 30 分钟，可配置 15/30/60 分钟；已有 token 不延寿。
- Client Secret 默认 90 天，可更短；创建/轮换响应只显示一次明文。
- client、secret、token 可分别禁用/撤销/轮换/归档；逐请求检查三层状态、scope、过期、额度。
- scope：`content:read`、`content:write`、`content:publish`、`media:read`、`media:write`、`analytics:read`、`submissions:read`、`admin:protected`。
- token 不能给自身扩权、修改授权、读取 secret/token 明文或审计原文；错误使用 `invalid_client`、`invalid_scope`、`insufficient_scope` 等，不泄露 client 是否存在。
- 接入方限流，超限 429 + `Retry-After` + `X-RateLimit-*`。

## 5. 内容 API 语义

基础路径 `/api/integrations/v1`。集合端点支持分页、排序、筛选和资源目录；单条支持详情与 ETag。写入统一使用：

- `POST /{resource}` 新增草稿；`PATCH /{resource}/{id}` 编辑草稿，要求 `If-Match`。
- `POST /{resource}/{id}/submit|approve|publish|unpublish|restore|rollback` 管理生命周期。
- `GET /{resource}/{id}/revisions`、`GET /{resource}/{id}/diff` 查看版本。
- `GET /operations/{operationId}` 查询持久化回执；`GET /audit` 管理员读脱敏审计。
- 所有写操作支持 `Idempotency-Key`；同 key 不同请求体返回 409；ETag 冲突返回 412。

写入只接受 schema 化 JSON，拒绝未知字段、路径穿越、脚本/危险 HTML、远程资源抓取、跨资源不存在引用和无证据效果承诺。公开读取只返回已发布内容；草稿不影响当前公开版。

## 6. 页面区块、媒体与公开渲染

`pages` 使用 `pageKey/title/seo/blocks/status/version`；block 白名单为 `hero`、`richText`、`featureGrid`、`cta`、`faq`、`journey`、`statsReference`、`media`。首页 Hero/CTA、关于页定位/优势、联系页、列表页标题、AI 搜索增长专页固定文案迁移到结构化默认快照，布局不变。

媒体存储在 release 外的 `MEDIA_DIR`；服务端校验 multipart MIME/魔数/扩展名/大小/尺寸，返回稳定 asset id + 版本 URL；被公开内容引用时只能软删并提示引用数。

## 7. 管理后台与验收

新增 `/admin/integrations`、`/admin/content`、`/admin/media`、`/admin/audit`、`/admin/operations`。中间区承担列表、编辑、审核、发布、回滚；右侧只放状态、差异、失败原因、常用修复。UI 隐藏不等于权限，服务端必须拒绝。

分支验收：`npm test`、授权/内容/恢复/安全/路由测试、`npx tsc --noEmit`、`npm run build`、OpenAPI JSON/路由覆盖检查、隔离 HTTP 全流程、桌面/736px/320px UI。发布前需独立代码/安全评审、shared-data/SQLite 备份恢复预演、默认配置失败关闭。生产验收必须以 current/release/公开页面/回执为证据，不能以 mock、fixture、health、build 或 SDK 样例替代。
