# 寰引智能官网第三方代运营 API 接入指南

> 提供方：寰引智能官网；接口路径版本 v1，契约/SDK 交付版本 1.8.1。
> 本指南描述官网对外接口。第三方内部模型、任务系统和连接器由接入方自行实现。

## 接入材料与授权

- 基础地址：`https://huanyinai.com/api/integrations/v1`。
- 权威契约：[OpenAPI](full-site-operations.openapi.json)。服务端 SDK：`sdk/site-operations.mjs`；最小草稿例子：`sdk/example-draft.mjs`。
- 官网管理员在 `/admin/integrations` 创建接入方，授予 scope、资源/记录范围、合作截止、Secret/Token 时效。管理员持有官网会话，不把管理员密码交给第三方。
- Client Secret 仅在创建/轮换时安全交付；第三方保存于服务端秘密管理设施，不能放浏览器、仓库或日志。正式创建与交付凭据属于实际合作接入步骤。
- 默认 Token 30 分钟，允许的 Token 时长为 15/30/60 分钟；Secret 默认 90 天，合作截止为独立上限。以具体授权为准。
- 禁用、撤销、权限收缩立即影响已发 Token。管理员通过管理后台执行；第三方不能通过 Token 管理合作方或审核权限。

## 获取 Token 与发现资源

`POST /oauth/token`，Content-Type 为 `application/x-www-form-urlencoded`，body 为 `grant_type=client_credentials`。HTTP Basic 使用 Client ID 和 Client Secret，分别 URL 编码后用冒号连接再 Base64；也支持 body 中的 client_id/client_secret，但不能同时发送 Basic 和表单凭据。可传 scope 申请已授权范围的子集。

返回 access_token、token_type=Bearer、expires_in（秒）和 scope。后续请求发送 `Authorization: Bearer <token>`。SDK 会缓存 Token、到期前刷新并合并并发鉴权；401 会清除缓存，下一次显式调用重新鉴权。SDK 不自动重放失败的写请求。

`GET /resources` 是当前身份可用资源目录，不是公开 CMS 字段编辑入口。返回资源字段顶层规则和读/写/发布标识；最终每次请求仍校验实际授权。

字段规则：s 字符串、n 数字、b 布尔值、a 字符串数组、o 对象数组、r 对象，后缀 ? 表示可选。嵌套校验以 OpenAPI、页面模板和运行时校验为准。

| scope | 能力 | 边界 |
|---|---|---|
| content:read | 资源和记录读取 | 仅授权资源/记录；没有 write 时只看到公开已发布快照 |
| content:write | 草稿新增/修改、提交及允许的生命周期、修订与差异读取 | 同时满足资源/记录范围，写权限不等于发布或审核权限 |
| content:publish | 发布/下线 | 普通自动发布还需 autoPublish；保护修改仍由管理员近期复核 |
| media:read / media:write | 媒体读取 / 上传、元信息、替换、软删与恢复 | 同时满足 media 范围与记录限制 |
| analytics:read | 第一方汇总和自己的操作 | 不证明搜索收录、排名、AI 引用或增长 |
| submissions:read | 咨询线索 | 敏感能力，默认不授予；还需 submissions 资源授权 |

10 类内容资源：blog-posts、cases、industries、company、customers、capabilities、stats、contacts、settings、pages。company/settings 的现有记录 ID 为 singleton。其他 ID 以 list/get 返回为准，不由客户端猜测。

## 新增、修改和生命周期

1. `GET /{资源}?limit=25` 返回 items、hasMore、nextCursor。下一页使用 cursor=nextCursor；status/q/sort 的实际支持值按契约与服务端校验，不能假设任意排序表达式。
2. `POST /{资源}` 发送完整资源数据，新建 draft。常用博客字段为 slug、title、excerpt、category、tags、date、author、sections（heading/body 对象数组）。字段不能放入 data envelope。
3. `GET /{资源}/{id}` 获得记录和 etag；`PATCH` 发送部分顶层字段并带 `If-Match`。可用返回的裸 etag 或带双引号 HTTP ETag。嵌套对象/数组整体替换，不执行深度合并。slug/pageKey 不允许改变；建议从 PATCH 省略。
4. `POST /{资源}/{id}/submit` 提交审核。第三方不能 approve；官网管理员在 `/admin/content` 审核。
5. `POST .../publish` 在授权及内容证据满足时发布。博客发布需要 reviewStatus=reviewed、非空 sources、reviewer/reviewedAt 等证据；不能凭模型生成就声明已经审核。案例客户/指标等保护事实另受治理。
6. unpublish、archive、restore、rollback 按实际状态机执行。rollback body 为 `{ "revision": 1 }`，恢复成 draft，再提交审核/发布才改变公开版。

受保护内容包括品牌、客户、联系方式、营销统计及 canonical/robots/法律等字段。pages 是固定模板：允许的 pageKey、block ID/type/order/props 在 OpenAPI 与 `docs/page-field-map.md`；不支持任意 HTML、脚本、布局或新 URL 页面生成。

`GET .../revisions` 与 `GET .../diff?from=1&to=2` 需要写范围。`GET /operations/{operationId}` 只可读取自己的持久化回执。`/audit` 对第三方拒绝；管理端审计在 `/admin/audit`。

## 幂等、错误与结果判断

为每个写入意图生成 8–128 字符的 `Idempotency-Key`，失败重试沿用同一键、原方法/路径/载荷和原 If-Match；新意图使用新键。同键不同请求返回 409。并发修改收到 412 后，应重新读取、合并业务意图，再用新键提交。

写请求 HTTP 202 返回 operationId/status 等回执。只有 committed 表示操作完成；pending 需查询回执；failed/needs_recovery 需保存回执并由管理员处理，不能继续当作已发布。

| 状态 | 处理 |
|---|---|
| 400 / 413 / 415 | 修正字段、JSON、体积或 Content-Type；不盲重试 |
| 401 | 检查 Token/Secret/合作时效或撤销；SDK 清缓存但不会自动重放写操作 |
| 403 | 检查 scope、资源/记录范围及治理权限；不要改用管理员密码 |
| 409 | 区分幂等冲突、不可变 ID、状态、引用或审核证据错误 |
| 412 / 428 | ETag 已过期 / 缺失；重新读取并按新意图处理 |
| 429 | 按 Retry-After 等待；保留原幂等键 |
| 503 | 区分服务禁用与失败回执；有 operationId 时先查回执，再决定恢复/重试 |

SDK 的 SiteOperationsError 包含 code/status/requestId/retryAfter/details；操作失败时另含 operationId/operationStatus/receipt。网络中断不能证明服务器未执行，恢复后沿用原幂等键或查询已有回执；不要生成新键反复写入。

公开生效应再核对记录的 publicStatus/publishedVersion、目标页面、sitemap/llms 和相关元信息。API 接受、committed、公开页面变化及搜索引擎收录是不同证据。

## 媒体、监控与兼容

媒体写入必须提供独立幂等键：1–200 个可打印 ASCII 字符（不含空格）；推荐统一使用 8–128 字符以同时满足内容与媒体规则。媒体使用 `/media` GET/POST、`/media/{id}` GET/PUT/PATCH/DELETE 和 `/media/{id}/restore` POST。上传/替换是 multipart/form-data；SDK request 是 JSON 辅助方法，文件上传使用服务端原生 fetch/FormData。图片支持 PNG/JPEG/WebP，最大 10 MiB，服务端验证 MIME、解码、尺寸和引用。不能上传任意文件或脚本。

管理员通过 `/admin/operations` 处理回执、`/admin/audit` 查审计、`/admin/integrations` 管理授权。运维 readiness 必须 integrity=ok、pending=0 且 10 类公开快照可读取；health 单独不能证明内容投影完成。受控测试运行方法与恢复方式见 `docs/operations.md`。

v1 路径保持兼容；1.8.1 补具体资源 schema、SDK 错误字段和文档，不改变既有授权、生命周期或数据。更改必填字段、字段类型、权限或生命周期语义属于破坏性变更，需新路径版本或明确迁移期；不得静默收缩第三方契约。服务端安全修复与撤销继续按治理规则执行。

## 提供方自测与真实第三方联调

提供方使用临时 DATA_DIR/SQLite、隔离本机端口和测试授权，验收 Token、全部资源、草稿/公开隔离、ETag、幂等、审核发布/恢复、拒绝敏感权限及撤销；测试不可指向正式 shared-data。自测证明接口可接入，不证明某第三方已接通。

第三方实际合作时另行创建最小授权，按所需资源用自有服务端调用；真实联调记录 scope、接口版本、脱敏 requestId/operationId 与撤销结果。不得将凭据写入交接文档。
