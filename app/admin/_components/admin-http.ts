// Shared browser transport. Never persist passwords, secrets or tokens.
let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;
function readCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const value = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith('huanyin_admin_csrf='));
  try { return value ? decodeURIComponent(value.slice('huanyin_admin_csrf='.length)) : null; } catch { return null; }
}
const messages: Record<string, string> = {
  csrf: '登录校验已失效，请刷新页面后重试', etag_mismatch: '内容已被其他人修改，请刷新并重新核对；未覆盖对方修改',
  precondition_failed: '内容版本已变化，请刷新后重试', reauth_required: '请重新输入管理员密码进行近期复核',
  recent_auth_required: '请输入管理员密码进行近期复核后重试',
  owner_review_required: '该操作涉及保护字段，必须由管理员进行近期复核',
  approval_required: '当前工作版本尚未批准，请先提交审核并批准后再发布',
  invalid_password: '复核密码不正确', invalid_state: '当前状态不允许此操作，请刷新并核对审核流程',
  insufficient_scope: '授权 scope 不足', invalid_client: '客户端已停用、撤销或到期，请核对合作截止和密钥有效期',
  invalid_token: 'Token 已过期或撤销，重新取 token 不会续期合作', rate_limited: '请求过于频繁，请稍后重试',
  projection_pending: '公开快照已持久化，但兼容投影尚未完成；请到操作回执执行恢复',
};
export class AdminRequestError extends Error {
  operationId?: string;
  constructor(message: string, operationId?: string) { super(message); this.name = 'AdminRequestError'; this.operationId = operationId; }
}
function errorText(data: Record<string, unknown>, status: number): string {
  const code = typeof data.error === 'string' ? data.error : typeof data.errorCode === 'string' ? data.errorCode : '';
  return messages[code] || (typeof data.message === 'string' ? data.message : code) || `请求失败（${status}）`;
}
async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data as Record<string, unknown>;
  } catch { throw new Error(`服务端返回无效 JSON（${response.status}）；未确认成功，请核对操作回执`); }
}
export async function ensureCsrfToken(): Promise<string> {
  const cookie = readCookie();
  if (cookie) { csrfToken = cookie; return cookie; }
  if (csrfToken) return csrfToken;
  if (!csrfRequest) csrfRequest = (async () => {
    const response = await fetch('/api/admin/integrations', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(errorText(await parseJson(response), response.status));
    csrfToken = response.headers.get('X-CSRF-Token') || readCookie();
    if (!csrfToken) throw new Error('未获取到 CSRF Token，请刷新登录状态后重试');
    return csrfToken;
  })().finally(() => { csrfRequest = null; });
  return csrfRequest;
}
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  const method = (init.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') headers.set('X-CSRF-Token', await ensureCsrfToken());
  const response = await fetch(input, { ...init, headers, credentials: 'same-origin' });
  const token = response.headers.get('X-CSRF-Token');
  if (token) csrfToken = token;
  // Do not automatically retry writes: a failed response may have persisted an operation.
  if (response.status === 401 || response.status === 403) csrfToken = null;
  return response;
}
export async function adminJson<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const response = await adminFetch(input, init);
  const data = await parseJson(response);
  const nested = data.receipt && typeof data.receipt === 'object' && !Array.isArray(data.receipt) ? data.receipt as Record<string, unknown> : undefined;
  // Asset/client lifecycle status is not an operation status. Media may carry its own
  // operationId alongside status=active/deleted and a separately nested receipt.
  const operationStatuses = ['pending', 'committed', 'failed', 'needs_recovery'];
  const topReceipt = typeof data.operationId === 'string' && typeof data.status === 'string' && operationStatuses.includes(data.status) ? data : undefined;
  const receipt = nested || topReceipt || (response.status === 202 ? data : undefined);
  const operationId = typeof receipt?.operationId === 'string' ? receipt.operationId : typeof data.operationId === 'string' ? data.operationId : undefined;
  if (!response.ok) throw new AdminRequestError(errorText(data, response.status), operationId);
  const mutation = !['GET', 'HEAD'].includes((init.method || 'GET').toUpperCase());
  const uncommitted = receipt && receipt.status !== 'committed';
  if (mutation && (data.success === false || uncommitted || (response.status === 202 && !receipt))) {
    throw new AdminRequestError(`${errorText(receipt || data, response.status)}；操作尚未完成（${String(receipt?.status || '未确认')}）${operationId ? `，回执 ${operationId}` : ''}`, operationId);
  }
  return data as T;
}
export const jsonRequest = (method: 'POST' | 'PUT' | 'DELETE', body: unknown): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
