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
