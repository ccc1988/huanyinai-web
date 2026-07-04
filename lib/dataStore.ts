import fs from "fs";
import path from "path";
import type { Customer, CaseItem, IndustrySolution, CapabilityItem, StatItem, BlogPost, Settings } from "./data";

const dataDir = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ===== 读取函数 =====
export const readData = {
  company: () => readJson<Record<string, string>>("company.json"),
  customers: () => readJson<Customer[]>("customers.json"),
  cases: () => readJson<CaseItem[]>("cases.json"),
  industries: () => readJson<IndustrySolution[]>("industries.json"),
  capabilities: () => readJson<CapabilityItem[]>("capabilities.json"),
  stats: () => readJson<StatItem[]>("stats.json"),
  blogPosts: () => readJson<BlogPost[]>("blog-posts.json"),
  settings: () => readJson<Settings>("settings.json"),
};

// ===== 写入函数 =====
export const writeData = {
  company: (data: Record<string, string>) => writeJson("company.json", data),
  customers: (data: Customer[]) => writeJson("customers.json", data),
  cases: (data: CaseItem[]) => writeJson("cases.json", data),
  industries: (data: IndustrySolution[]) => writeJson("industries.json", data),
  capabilities: (data: CapabilityItem[]) => writeJson("capabilities.json", data),
  stats: (data: StatItem[]) => writeJson("stats.json", data),
  blogPosts: (data: BlogPost[]) => writeJson("blog-posts.json", data),
  settings: (data: Settings) => writeJson("settings.json", data),
};
