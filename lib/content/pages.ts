import { readPublic } from "../operations/content.ts";
import { DEFAULT_PAGES, type PageContent } from "./defaultPages.ts";
import { PAGE_FIELDS, type PageFieldKey, type PageFields } from "./pageFields.ts";
import { validatePagesData } from "./pageSchema.ts";
export type { PageBlock, PageBlockType, PageContent } from "./defaultPages.ts";
export { DEFAULT_PAGES } from "./defaultPages.ts";
export { validatePage, validatePagesData, PageValidationError } from "./pageSchema.ts";

export function defaultPage(pageKey: string): PageContent | null {
  return DEFAULT_PAGES.find((page) => page.pageKey === pageKey) ?? null;
}

/** Public JSON snapshot only. readPublic must not seed, migrate, or write a database. */
export function getPage(pageKey: string, dataDir?: string): PageContent | null {
  try {
    const pages = validatePagesData(readPublic("pages", dataDir));
    return pages.find((page) => page.pageKey === pageKey) ?? defaultPage(pageKey);
  } catch {
    // Malformed/missing snapshots cannot break existing public pages.
    return defaultPage(pageKey);
  }
}

export function getPageBlock<T extends Record<string, unknown> = Record<string, unknown>>(pageKey: string, blockId: string, dataDir?: string): T {
  const block = getPage(pageKey, dataDir)?.blocks.find((item) => item.id === blockId);
  if (block?.enabled === false) return {} as T;
  const fallback = defaultPage(pageKey)?.blocks.find((item) => item.id === blockId)?.props ?? {};
  return { ...fallback, ...block?.props } as T;
}

/** Typed parameterized copy; missing props use exact defaults, empty strings are intentional. */
export function getPageFields<K extends PageFieldKey>(blockId: K, dataDir?: string): PageFields<K> {
  return getPageBlock(PAGE_FIELDS[blockId].pageKey, blockId, dataDir) as PageFields<K>;
}

export function isPageBlockEnabled(blockId: PageFieldKey, dataDir?: string): boolean {
  return getPage(PAGE_FIELDS[blockId].pageKey, dataDir)?.blocks.find((block) => block.id === blockId)?.enabled !== false;
}

export function getPageSeo<T extends { title: string; description: string }>(pageKey: string, defaults: T, dataDir?: string): T {
  return { ...defaults, ...getPage(pageKey, dataDir)?.seo };
}

/** Main-agent integration: server layout -> client AppShell -> Navbar/Footer copy props. */
export function getPageChrome(dataDir?: string) {
  return {
    navbar: getPageFields("site-navbar", dataDir),
    navbarEnabled: isPageBlockEnabled("site-navbar", dataDir),
    footer: getPageFields("site-footer", dataDir),
    footerEnabled: isPageBlockEnabled("site-footer", dataDir),
  };
}
