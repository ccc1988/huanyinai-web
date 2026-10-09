/** Server-side SDK. Store clientSecret outside source code and never run this in a browser. */
export class SiteOperationsError extends Error {
 constructor(code, {status, requestId, retryAfter, receipt, details} = {}) {
  super(code); this.name = 'SiteOperationsError'; this.code = code;
  this.status = status; this.requestId = requestId; this.retryAfter = retryAfter; this.details = details;
  if (receipt) { this.receipt = receipt; this.operationId = receipt.operationId; this.operationStatus = receipt.status; }
 }
}
export class SiteOperationsClient {
 #base; #clientId; #secret; #token; #expires = 0; #fetch; #grant;
 constructor({baseUrl, clientId, clientSecret, fetchImpl = fetch, allowLocalhost = false}) {
  const u = new URL(baseUrl);
  if (u.protocol !== 'https:' && !(allowLocalhost && u.protocol === 'http:' && ['localhost','127.0.0.1'].includes(u.hostname))) throw new Error('https_required');
  if (u.username || u.password || u.search || u.hash) throw new Error('invalid_base');
  this.#base = u.href.replace(/\/$/, ''); this.#clientId = clientId; this.#secret = clientSecret; this.#fetch = fetchImpl;
 }
 async #json(response) {
  try { return await response.json(); }
  catch { throw new SiteOperationsError('invalid_json_response', {status:response.status, requestId:response.headers.get('X-Request-Id'), retryAfter:response.headers.get('Retry-After')}); }
 }
 async #accessToken() {
  if (this.#token && Date.now() < this.#expires) return this.#token;
  if (!this.#grant) this.#grant = this.#issueToken().finally(() => { this.#grant = undefined; });
  return this.#grant;
 }
 async #issueToken() {
  const authorization = 'Basic ' + Buffer.from(encodeURIComponent(this.#clientId) + ':' + encodeURIComponent(this.#secret)).toString('base64');
  const response = await this.#fetch(this.#base + '/oauth/token', {method:'POST', redirect:'error', headers:{Authorization:authorization, 'Content-Type':'application/x-www-form-urlencoded'}, body:'grant_type=client_credentials'});
  const data = await this.#json(response);
  if (!response.ok) throw new SiteOperationsError('token_' + (data.error || response.status), {status:response.status, requestId:data.requestId || response.headers.get('X-Request-Id'), retryAfter:response.headers.get('Retry-After')});
  if (typeof data.access_token !== 'string' || !data.access_token || data.token_type !== 'Bearer' || !Number.isFinite(data.expires_in) || data.expires_in <= 0) throw new SiteOperationsError('invalid_token_response');
  this.#token = data.access_token; this.#expires = Date.now() + Math.max(0, data.expires_in - 5) * 1000; return this.#token;
 }
 async request(path, {method = 'GET', body, etag, idempotencyKey} = {}) {
  if (typeof path !== 'string' || !/^\/(?!\/)/.test(path) || /[\\\x00-\x20#]/.test(path)) throw new Error('relative_path_required');
  let pathname = path.split('?')[0];
  for (let i = 0; i < 3; i++) {
   if (pathname.split('/').some(segment => segment === '.' || segment === '..') || /\\|%(?:2f|5c)/i.test(pathname)) throw new Error('relative_path_required');
   const decoded = decodeURIComponent(pathname); if (decoded === pathname) break; pathname = decoded;
  }
  const target = new URL(this.#base + path), base = new URL(this.#base);
  if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname.replace(/\/$/, '') + '/')) throw new Error('relative_path_required');
  const headers = {Authorization:'Bearer ' + await this.#accessToken()};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (etag) headers['If-Match'] = etag;
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const response = await this.#fetch(target.href, {method, headers, redirect:'error', body:body === undefined ? undefined : JSON.stringify(body)});
  if (response.status === 401) { this.#token = undefined; this.#expires = 0; }
  const data = await this.#json(response);
  if (!response.ok || data.status === 'failed' || data.status === 'needs_recovery') {
   throw new SiteOperationsError(data.error || data.errorCode || 'api_' + response.status, {status:response.status, requestId:data.requestId || response.headers.get('X-Request-Id'), retryAfter:response.headers.get('Retry-After'), receipt:data.operationId ? data : undefined, details:data.details});
  }
  // pending is returned for explicit receipt polling; only committed proves completed mutation.
  return data;
 }
 list(resource, params = {}) { return this.request('/' + encodeURIComponent(resource) + '?' + new URLSearchParams(params)); }
 get(resource, id) { return this.request('/' + encodeURIComponent(resource) + '/' + encodeURIComponent(id)); }
 create(resource, data, idempotencyKey) { return this.request('/' + encodeURIComponent(resource), {method:'POST', body:data, idempotencyKey}); }
 patch(resource, id, data, etag, idempotencyKey) { return this.request('/' + encodeURIComponent(resource) + '/' + encodeURIComponent(id), {method:'PATCH', body:data, etag, idempotencyKey}); }
 action(resource, id, action, body = {}, idempotencyKey) { return this.request('/' + encodeURIComponent(resource) + '/' + encodeURIComponent(id) + '/' + encodeURIComponent(action), {method:'POST', body, idempotencyKey}); }
 receipt(id) { return this.request('/operations/' + encodeURIComponent(id)); }
}
