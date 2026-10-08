# 全站代运营 API v1 实施计划

> 日期：2026-10-08（中国标准时间）
> 分支：`codex/full-site-operations-api-20261008`
> 基线：`33ef61d`
> 唯一结果：交付可审计全站运营 API、机器授权生命周期、统一内容治理、持久化回执、OpenAPI 与可操作后台；分支验证后再决定是否发布。

## 执行契约

- 范围：W1-W5 官网代码/测试/OpenAPI/后台，W6 本机 `可复用经验/`。
- 不做：不改 AIGEO 独立项目；不冒称消费方真实接通；不开放 root/Git/任意代码执行/数据库直连/SMTP 凭据；不重写营销统计；不在 production current/main 直接试验。
- 云端写入仅限隔离 worktree；测试 DATA_DIR/MEDIA_DIR/SQLite 必须临时隔离。
- 发布门禁：单测、契约/负向/恢复、安全/类型/构建、隔离 HTTP、UI、独立评审、备份恢复预演全部有证据后才发布。

## 文件边界

- `lib/operations/config.ts`：数据目录、默认关闭、上限。
- `lib/operations/db.ts`：node:sqlite schema/迁移/事务/恢复 intent。
- `lib/operations/auth.ts`：client/secret/token hash、scope、时效、撤销、轮换、限流。
- `lib/operations/content.ts`：resource registry、schema、draft/revision/review/publish/rollback、ETag、幂等。
- `lib/operations/receipt.ts`：operation receipt、audit、前后 hash。
- `lib/operations/media.ts`：MIME/魔数/大小/尺寸、asset、引用和软删。
- `lib/content/pages.ts`：页面 block 白名单和既有固定文案默认值。
- `app/api/integrations/v1/**`：OAuth、资源、生命周期、operations、analytics、audit。
- `app/api/admin/{integrations,content,media,audit,operations}/**` 与对应后台页面。
- `test/operations/**`、`test/integrations-api.test.ts`、`test/contract.test.ts`。
- 既有 `lib/data.ts`/`dataStore.ts`、首页/关于/联系/AI GEO/AEO、SEO/llms/sitemap 仅改为共同服务/已发布快照读取，布局与默认内容不变。

## TDD 工作包

### T1/W1 授权底座（FULL-09）

先写红测：client credentials、scope 子集、15/30/60 分钟 token、90 天 secret、仅 hash、不泄露、立即禁用/撤销、过期、限流、错误码。再实现 SQLite schema、opaque token、逐请求三层校验、管理 API。交付授权负向证据。

### T2/W2 统一内容服务（FULL-01/02/03/05/10）

先写红测：资源 schema、draft/public 分离、revision、submit/approve/publish/unpublish/restore/rollback、If-Match、幂等、intent recovery。实现 registry + JSON adapter；旧后台 API 复用同一 service。证明编辑草稿不影响公开版，发布才更新快照且有回执。

### T3/W3 页面/SEO/媒体（FULL-04/06/07）

逐字段映射 Hero/CTA、关于、联系、AI 搜索增长、SEO 输入；snapshot/hash 证明默认展示不变。加入 pages/block 白名单、媒体魔数/大小/引用软删。拒绝任意 HTML/JS/远程抓取。

### T4/W4 外部 API/契约/后台（FULL-01-FULL-10）

接入 endpoint、统一错误/request id/ETag，执行 OpenAPI JSON parse 与路由覆盖检查；后台提供授权、内容、审核、媒体、回执、审计和修复，权限由服务端落实。提供 AIGEO 适配样例但不改其仓库。

### T5/W5 验证与评审（ACC-01-10）

隔离环境跑 `npm test`、`npx tsc --noEmit`、`npm run build`、契约/负向/恢复、OAuth 全流程、真实页面读取；浏览器验证桌面/736/320。独立检查 CSRF、路径穿越、日志泄密、保护字段、限流、双事实源恢复。

### T6 发布与串行生产验收

只在 T1-T5 通过后，备份 shared-data/SQLite，执行标准 deploy，记录 source SHA/current/release/PM2/health/公开页面与授权回执。生产发布和 AIGEO 消费方联调分开，不把本地/fixture/SDK 结果写成生产事实。

## 需求追踪

| 需求 | 主要实现 | 证据 |
| --- | --- | --- |
| FULL-01/02/03 | content registry + lifecycle routes | 资源/修订/发布/回滚测试 |
| FULL-04 | pages/blocks + page consumers | snapshot/hash/UI |
| FULL-05/06 | protected fields + SEO readers | 保护字段/SEO 测试 |
| FULL-07 | media service/routes | MIME/size/reference |
| FULL-08 | analytics aggregate route | 聚合权限测试 |
| FULL-09 | auth service + admin | OAuth/scope/revoke/expiry |
| FULL-10 | db/revision/receipt/audit | ETag/idempotency/recovery |
| ACC-01-10 | T5/T6 | 分支/HTTP/生产证据 |
| KB-REUSE-01 | MyBooks `可复用经验/` | 来源/状态/参数化复核 |

## 风险/回滚

SQLite/JSON 不一致则标记 `needs_recovery`，不宣称成功；保护字段误改用 before/after hash + rollback；媒体引用只软删；发布失败不切 current；任何生产异常回退上一 release 和备份；外部授权可即时撤销。
