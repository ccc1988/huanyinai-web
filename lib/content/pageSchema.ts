import { PAGE_FIELDS, PAGE_TEMPLATE_ORDER } from "./pageFields.ts";

export type PageBlockType = "hero" | "richText" | "featureGrid" | "cta" | "faq" | "journey" | "statsReference" | "media";
export interface PageBlock {
  id: string;
  type: PageBlockType;
  enabled: boolean;
  order: number;
  props: Record<string, unknown>;
}
export interface PageContent {
  pageKey: string;
  title: string;
  seo: { title?: string; description?: string };
  blocks: PageBlock[];
}

export class PageValidationError extends Error {
  readonly errors: string[];
  constructor(errors: string[]) {
    super(`invalid_pages: ${errors.join("; ")}`);
    this.name = "PageValidationError";
    this.errors = errors;
  }
}

const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const definitions = PAGE_FIELDS as Record<string, { pageKey: string; type: string; props: Record<string, unknown> }>;
const pageKeys = new Set(Object.values(definitions).map((field) => field.pageKey));
const unsafeText = /<\s*(?:[a-z!/])|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/i;

function keys(value: Record<string, unknown>, allowed: readonly string[], at: string, errors: string[]) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) errors.push(`${at}.${key}: unknown_field`);
}
function text(value: unknown, at: string, errors: string[], max = 12000) {
  if (typeof value !== "string" || value.length > max || unsafeText.test(value)) errors.push(`${at}: safe_text_required`);
}
function href(value: string, at: string, errors: string[]) {
  // No external fetch, protocols, scheme-relative URLs, backslashes or encoded traversal.
  if (!/^(?:\/(?!\/)|#[a-zA-Z][\w-]*$)/.test(value) || /[\s\\]/.test(value)) {
    errors.push(`${at}: internal_href_required`); return;
  }
  try {
    let decoded = value;
    for (let i = 0; i < 4; i++) {
      if (/%(?:2f|5c|0[0-9a-f]|1[0-9a-f])/i.test(decoded)) { errors.push(`${at}: unsafe_href_encoding`); return; }
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    if (/[\\\u0000-\u0020]/.test(decoded) || decoded.startsWith("//") || decoded.split(/[/?#]/).some((part) => part === "." || part === "..") || /^\/(?:api|admin|_next)(?:[/?#]|$)/i.test(decoded)) errors.push(`${at}: unsafe_href`);
  } catch { errors.push(`${at}: invalid_url_encoding`); }
}
function matches(value: unknown, sample: unknown, at: string, errors: string[], partial = false): void {
  if (typeof sample === "string") {
    text(value, at, errors);
    if (/href\d*$/i.test(at) && typeof value === "string") href(value, at, errors);
    return;
  }
  if (Array.isArray(sample)) {
    if (!Array.isArray(value) || value.length > 100) { errors.push(`${at}: array_required_max_100`); return; }
    // Fixed icon-bearing service slots and table/journey row arity preserve the static renderer.
    if (at.endsWith(".servicePillars") && value.length !== sample.length) errors.push(`${at}: fixed_service_slots_required`);
    if (/\[\d+\]$/.test(at) && Array.isArray(sample[0]) === false && value.length !== sample.length) errors.push(`${at}: row_arity_required`);
    for (let i = 0; i < value.length; i++) matches(value[i], sample[0], `${at}[${i}]`, errors, false);
    return;
  }
  if (object(sample)) {
    if (!object(value)) { errors.push(`${at}: object_required`); return; }
    keys(value, Object.keys(sample), at, errors);
    for (const key of Object.keys(sample)) {
      if (!own(value, key)) { if (!partial) errors.push(`${at}.${key}: missing_field`); continue; }
      matches(value[key], sample[key], `${at}.${key}`, errors);
    }
    return;
  }
  errors.push(`${at}: unsupported_field`);
}
function checkPage(value: unknown, at: string, errors: string[]): void {
  if (!object(value)) { errors.push(`${at}: object_required`); return; }
  keys(value, ["pageKey", "title", "seo", "blocks"], at, errors);
  if (typeof value.pageKey !== "string" || !pageKeys.has(value.pageKey)) errors.push(`${at}.pageKey: unknown_page`);
  text(value.title, `${at}.title`, errors, 300);
  if (typeof value.title === "string" && !value.title.trim()) errors.push(`${at}.title: required`);
  if (!object(value.seo)) errors.push(`${at}.seo: object_required`);
  else {
    keys(value.seo, ["title", "description"], `${at}.seo`, errors);
    if ((value.pageKey === "home" || value.pageKey === "site-chrome") && Object.keys(value.seo).length) errors.push(`${at}.seo: seo_owned_by_settings`);
    for (const key of Object.keys(value.seo)) text(value.seo[key], `${at}.seo.${key}`, errors, key === "title" ? 300 : 3000);
  }
  if (!Array.isArray(value.blocks) || value.blocks.length > 50) { errors.push(`${at}.blocks: array_required_max_50`); return; }
  const ids = new Set<string>();
  let previousOrder = -1;
  value.blocks.forEach((block: unknown, index: number) => {
    const location = `${at}.blocks[${index}]`;
    if (!object(block)) { errors.push(`${location}: object_required`); return; }
    keys(block, ["id", "type", "enabled", "order", "props"], location, errors);
    const definition = typeof block.id === "string" && own(definitions, block.id) ? definitions[block.id] : undefined;
    if (!definition || definition.pageKey !== value.pageKey) { errors.push(`${location}.id: unknown_block_for_page`); return; }
    if (ids.has(block.id as string)) errors.push(`${location}.id: duplicate_block`);
    ids.add(block.id as string);
    if (block.type !== definition.type) errors.push(`${location}.type: block_type_mismatch`);
    if (typeof block.enabled !== "boolean") errors.push(`${location}.enabled: boolean_required`);
    if (!Number.isSafeInteger(block.order) || (block.order as number) < 0 || (block.order as number) > 10000) errors.push(`${location}.order: integer_0_to_10000_required`);
    const expectedOrder = PAGE_TEMPLATE_ORDER[block.id as keyof typeof PAGE_TEMPLATE_ORDER];
    if (block.order !== expectedOrder) errors.push(`${location}.order: fixed_template_slot_${expectedOrder}_required`);
    if (typeof block.order === "number" && block.order <= previousOrder) errors.push(`${location}.order: template_order_must_be_increasing`);
    if (typeof block.order === "number") previousOrder = block.order;
    matches(block.props, definition.props, `${location}.props`, errors, true);
  });
}

/** Returns the validated page; throws PageValidationError with field paths on failure. */
export function validatePage(data: unknown): PageContent {
  const errors: string[] = [];
  checkPage(data, "page", errors);
  if (errors.length) throw new PageValidationError(errors);
  return data as PageContent;
}

/** pages.json is an array, never a keyed object or an API envelope. */
export function validatePagesData(data: unknown): PageContent[] {
  if (!Array.isArray(data) || data.length > 50) throw new PageValidationError(["pages: array_required_max_50"]);
  const errors: string[] = [];
  const keys = new Set<string>();
  data.forEach((page, index) => {
    checkPage(page, `pages[${index}]`, errors);
    if (object(page) && typeof page.pageKey === "string") {
      if (keys.has(page.pageKey)) errors.push(`pages[${index}].pageKey: duplicate_page`);
      keys.add(page.pageKey);
    }
  });
  if (errors.length) throw new PageValidationError(errors);
  return data as PageContent[];
}
