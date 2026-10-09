# 2026-10-09 官网 API 提供方执行契约

- 业务目标：第三方根据官网提供方契约独立接入、维护授权 SEO/GEO 内容。
- 唯一规格：docs/specs/20261009-provider-api-prd.md v0.2，用户纠偏批准的提供方范围。历史消费方 PRD/评审不再作为执行要求。
- 基线：source/main、隔离分支与 current 均 dcf7d17，工作树干净；沿用既有云端 worktree。
- 范围：PROVIDER-01..08；核验基座，补准确 OpenAPI、SDK 可诊断错误、接入说明、隔离验收及发布/复用记录。
- 不做：第三方内部连接器、AIGEO 代码、自动凭据发放、多租户门户；不改变正式内容、营销统计、授权规则。
- 文件边界：scripts/generate-operations-openapi.mjs、docs/api/**、sdk/site-operations.mjs、test/operations/provider-contract.test.ts、docs/operations.md、当前契约/发布说明；README/CHANGELOG 与 package 版本仅同步交付导航。
- 验收：npm test；npx tsc --noEmit；npm run build；node scripts/operations-http-acceptance.mjs（临时 DATA_DIR）；OpenAPI 重生成一致；标准发布后 health/readiness/保护数据 hash 与公开接口验证。
- 假设：现有后台授权/治理功能可沿用；以测试和当前云端核验确认为准。
- 偏差：仅修正提供方描述与 SDK 错误信息，不增加业务权限或状态；新的权限/数据语义变更须记录并单独复核。
- 访问纠正：第一次凭据读取使用 strip() 改变密码首尾空白造成认证失败；仅去除 security 输出换行后认证成功。无需更换服务器凭据。
