import fs from "fs";
import path from "path";

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
  customers: () => readJson<typeof import("./data").customers>("customers.json"),
  cases: () => readJson<typeof import("./data").cases>("cases.json"),
  industries: () => readJson<typeof import("./data").industries>("industries.json"),
  capabilities: () => readJson<typeof import("./data").capabilities>("capabilities.json"),
  stats: () => readJson<typeof import("./data").stats>("stats.json"),
  blogPosts: () => readJson<typeof import("./data").blogPosts>("blog-posts.json"),
  settings: () => readJson<Record<string, unknown>>("settings.json"),
};

// ===== 写入函数 =====
export const writeData = {
  company: (data: Record<string, string>) => writeJson("company.json", data),
  customers: (data: unknown[]) => writeJson("customers.json", data),
  cases: (data: unknown[]) => writeJson("cases.json", data),
  industries: (data: unknown[]) => writeJson("industries.json", data),
  capabilities: (data: unknown[]) => writeJson("capabilities.json", data),
  stats: (data: unknown[]) => writeJson("stats.json", data),
  blogPosts: (data: unknown[]) => writeJson("blog-posts.json", data),
  settings: (data: Record<string, unknown>) => writeJson("settings.json", data),
};
