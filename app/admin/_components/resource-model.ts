export type ContentData = Record<string, unknown>;
export const fieldLabels: Record<string, string> = {
  body: '段落正文', q: '问题', a: '回答', tags: '标签', industry: '行业', relatedCases: '相关案例', oneLiner: '一句话成果', painPoints: '痛点', solution: '解决方案', customerValue: '客户价值', scenarios: '场景', hasDetailPage: '启用详情页', solutions: '解决方案列表', products: '产品列表', module: '能力模块', fullName: '公司全名', shortName: '公司简称', website: '网站', wechat: '微信', foundingDate: '成立日期', location: '所在地', role: '角色', qrCode: '二维码', seoTitle: 'SEO 标题', seoDescription: 'SEO 描述', seoKeywords: 'SEO 关键词', reviewedAt: '审核时间', accessedAt: '查阅时间', disclaimer: '声明', evidence: '证明材料', mediaIds: '关联媒体 ID', canonicalBase: '规范域名', robotsIndex: '允许索引', legalNotice: '法律声明', id: '标识', slug: '链接标识（slug）', title: '标题', name: '名称', excerpt: '摘要', description: '描述', content: '正文', text: '内容',
  category: '分类', date: '日期', author: '作者', sections: '正文段落', heading: '小标题', paragraphs: '段落列表',
  sources: '来源证据', reviewer: '审核人', reviewStatus: '证据审核状态', metrics: '成果指标', relatedCustomers: '相关客户',
  seo: '搜索展示', blocks: '页面区块', pageKey: '页面标识', type: '类型', enabled: '启用', order: '排序', props: '区块内容',
  titlePrimary: '主标题', titleSecondary: '副标题', primaryLabel: '主要按钮文案', primaryHref: '主要按钮链接',
  secondaryLabel: '次要按钮文案', secondaryHref: '次要按钮链接', href: '链接', url: '地址', label: '显示文案', alt: '图片替代文字',
  image: '图片', imageUrl: '图片地址', icon: '图标', features: '特点', items: '条目', value: '数值', suffix: '单位',
  navItems: '导航条目', siteName: '站点名称', email: '邮箱', phone: '电话', address: '地址', status: '状态', subtitle: '副标题',
};
const defaults: Record<string, ContentData> = {
  'blog-posts': { slug: '', title: '', excerpt: '', category: '', tags: [], date: new Date().toISOString().slice(0, 10), author: '', sections: [] },
  cases: { slug: '', title: '', industry: '', relatedCustomers: [], oneLiner: '', painPoints: [], solution: '', customerValue: [], scenarios: [], tags: [], hasDetailPage: true },
  industries: { slug: '', title: '', subtitle: '', painPoints: [], solutionSummary: '', relatedCases: [], faq: [] },
  company: { fullName: '', shortName: '', description: '', website: '', wechat: '', email: '', phone: '', foundingDate: '', location: '' },
  pages: { pageKey: '', title: '', seo: { title: '', description: '' }, blocks: [] },
  customers: { name: '', industry: '', solutions: [] }, capabilities: { module: '', products: [], scenarios: '', icon: '' },
  stats: { label: '', value: 0, suffix: '' }, contacts: { name: '', role: '', phone: '', wechat: '', qrCode: '' },
  settings: { seoTitle: '', seoDescription: '', seoKeywords: [], ogTitle: '', ogDescription: '', llmsTxtDescription: '', navItems: [], aiSearchGrowth: {} },
};
export const optionalFields: Record<string, ContentData> = {
  'blog-posts': { sources: [], reviewStatus: 'draft', reviewer: '', reviewedAt: '', mediaIds: [], order: 0 },
  cases: { metrics: [], disclaimer: '', evidence: [], mediaIds: [], order: 0 },
  industries: { shortTitle: '', metaTitle: '', metaDescription: '', servicePackages: [], process: [], deliverables: [], measurement: [], boundaries: [], mediaIds: [], order: 0 },
  settings: { canonicalBase: '', robotsIndex: true, redirects: [], legalNotice: '', ogImage: '' },
  customers: { order: 0 }, capabilities: { order: 0 }, stats: { order: 0 }, contacts: { order: 0 },
};
export function newResourceData(resource: string): ContentData { return structuredClone(defaults[resource] || { slug: '', title: '' }); }
export function emptyListItem(key: string, sample?: unknown): unknown {
  if (sample !== undefined) {
    if (Array.isArray(sample)) return [];
    if (sample && typeof sample === 'object') return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, typeof v === 'boolean' ? false : typeof v === 'number' ? 0 : Array.isArray(v) ? [] : v && typeof v === 'object' ? emptyListItem(k, v) : '']));
    return typeof sample === 'number' ? 0 : typeof sample === 'boolean' ? false : '';
  }
  if (key === 'sections') return { heading: '', body: '' };
  if (key === 'blocks') return { id: '', type: 'richText', enabled: true, order: 10, props: { title: '', description: '' } };
  if (key === 'navItems') return { label: '', href: '' };
  if (key === 'sources') return { title: '', url: '', accessedAt: new Date().toISOString() };
  if (key === 'evidence') return { title: '', url: '' };
  if (key === 'faq') return { q: '', a: '' };
  if (key === 'servicePackages') return { title: '', description: '', deliverables: [] };
  if (key === 'redirects') return { from: '', to: '', status: 301 };
  return '';
}
export function parseResourceJson(text: string): ContentData {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('内容必须是 JSON 对象，而非数组或空值');
  if (JSON.stringify(value).includes('"__proto__"')) throw new Error('不支持此字段');
  return value as ContentData;
}
