# 生产运行手册

## 事实来源

- 正式源码：`/var/www/huanyin_web/source`
- 当前版本：`/var/www/huanyin_web/current` 符号链接
- 历史版本：`/var/www/huanyin_web/releases`
- 持久化数据：`/var/www/huanyin_web/shared-data`
- 标准发布入口：`/var/www/huanyin_web/deploy.sh`

本机代码与 GitHub 不可替代生产取证。生产版本必须同时核对 `current`、Git SHA、PM2 和 `/health`。

## 发布前检查

1. 确认云端 `main` 工作树只有已知验证文件等允许保留项。
2. 备份本次涉及的 `shared-data` 文件和源码文件。
3. 运行 `npm test`、`npm run build` 和 `git diff --check`。
4. 确认 `ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`、`DATA_DIR` 已设置，不记录其值。

## 发布与验收

执行 `/var/www/huanyin_web/deploy.sh`。完成后核对：

- `readlink -f /var/www/huanyin_web/current`
- 当前 release 与源码 Git SHA 一致
- PM2 `huanyin-web` 为 online，异常重启为 0
- 内网和公网 `/health` 返回 `{"status":"ok"}`
- 本次涉及页面完成桌面、移动端与浏览器控制台验收

## 数据维护边界

- 案例、博客、行业方案、公司信息、首页客户、营销指标和站点设置优先通过后台维护。
- 行业详情长标题与首页短标题分开维护；新增行业后首页自动读取，不修改组件源码。
- 首页客户列表支持新增、编辑、删除和排序。真实名称须确认可公开展示；非客户扩展内容必须以“典型场景·”标识。
- `shared-data` 不随 release 覆盖；源码 `data` 仅作为初始化模板，两者的重要结构调整必须同步。

## 回滚

1. 将 `current` 原子切回上一个已验证 release。
2. 重启 PM2 并复核内外网 `/health`。
3. 仅当本次修改了持久化数据且确认需要撤销时，恢复对应备份文件；禁止整目录覆盖。
4. 记录回滚 release、原因、数据处理和验收结果。

## 已知边界

- 网站只有管理员与匿名访客两类角色，不建设多角色审批系统。
- 营销指标由管理员维护，不建设公开证据状态系统。
- 构建存在 Next.js 对动态文件读取的 NFT 提示，目前不影响构建与运行，后续作为性能维护项处理。

## 全站运营 API v1.8.0

- 机器接入端点：`/api/oauth/token`（兼容别名）与 `/api/integrations/v1/oauth/token`；外部只使用 HTTPS、client credentials、opaque Token。
- 公开内容读取来自已发布快照；工作草稿/审核/修订/回滚保存在 `DATA_DIR/operations.sqlite3`，JSON 是兼容投影。草稿编辑不改变公开页面。
- 接入方每次请求校验合作截止、Secret、Token、scope、资源范围和限流；禁用/撤销/权限收缩立即影响既有 Token。Token/Secret 明文不落库；合作 Token 默认 30 分钟，Secret 默认 90 天，合作截止取更早者。
- 普通内容必须走 draft → submit → approve → publish；明确授予 `autoPublish` 的普通内容可自动发布。品牌、客户、联系方式、统计数字、SEO 主域/robots/法律等保护字段仍需官网管理员近期复核。
- 内容 API 使用 `If-Match` 和 `Idempotency-Key`；成功写入返回 `operationId`/receipt。`failed`、`pending`、`needs_recovery` 都不能视为成功。
- 媒体写入使用服务端 MIME/解码/尺寸/大小校验，文件存放在 release 外的 `MEDIA_DIR`；引用中的资产只能软删，替换产生新版本。
- 运行前需配置 `OPERATIONS_API_ENABLED=true`、`DATA_DIR`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`；默认未启用，避免未授权打开外部 API。
- 首次或恢复使用：备份 shared-data/operations.sqlite3 → `DATA_DIR=/var/www/huanyin_web/shared-data node scripts/operations-migrate.mjs`（仅在 release 内执行）→ `node scripts/operations-readiness.mjs`。测试必须使用临时 DATA_DIR，不得指向生产。
- 本版本不证明 AIGEO 消费方真实联调，也不证明搜索收录、AI 引用、推荐、排名、增长或营收结果。
