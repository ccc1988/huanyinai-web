import fs from "fs";
import path from "path";
import type { Customer, CaseItem, IndustrySolution, CapabilityItem, StatItem, BlogPost, Settings, Contact, Submission, SmtpConfig, AdminConfig } from "./data";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  const tmpPath = filePath + ".tmp";
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpPath, filePath); // 原子操作，防止并发写入丢失
}

// ===== 读取函数 =====
export const readData = {
  company: () => readJson<Record<string, string>>("company.json"),
  customers: () => readJson<Customer[]>("customers.json"),
  cases: () => readJson<CaseItem[]>("cases.json"),
  industries: () => readJson<IndustrySolution[]>("industries.json"),
  capabilities: () => readJson<CapabilityItem[]>("capabilities.json"),
  stats: () => readJson<StatItem[]>("stats.json"),
  contacts: () => readJson<Contact[]>("contacts.json"),
  blogPosts: () => readJson<BlogPost[]>("blog-posts.json"),
  settings: () => readJson<Settings>("settings.json"),
  submissions: () => { try { return readJson<Submission[]>("submissions.json"); } catch { return []; } },
  smtpConfig: () => { try { return readJson<SmtpConfig>("smtp-config.json"); } catch { return { enabled: false, host: "", port: 465, secure: true, username: "", encryptedPassword: null, fromName: "寰引智能官网", fromEmail: "", recipients: [], subjectTemplate: "【新咨询】{company} - {name}" } as SmtpConfig; } },
  adminConfig: () => { try { return readJson<AdminConfig>("admin-config.json"); } catch { return { passwordHash: null, passwordSalt: null, updatedAt: null } as AdminConfig; } },
};

// ===== 写入函数 =====
export const writeData = {
  company: (data: Record<string, string>) => writeJson("company.json", data),
  customers: (data: Customer[]) => writeJson("customers.json", data),
  cases: (data: CaseItem[]) => writeJson("cases.json", data),
  industries: (data: IndustrySolution[]) => writeJson("industries.json", data),
  capabilities: (data: CapabilityItem[]) => writeJson("capabilities.json", data),
  stats: (data: StatItem[]) => writeJson("stats.json", data),
  contacts: (data: Contact[]) => writeJson("contacts.json", data),
  blogPosts: (data: BlogPost[]) => writeJson("blog-posts.json", data),
  settings: (data: Settings) => writeJson("settings.json", data),
  submissions: (data: Submission[]) => writeJson("submissions.json", data),
  smtpConfig: (data: SmtpConfig) => writeJson("smtp-config.json", data),
  adminConfig: (data: AdminConfig) => writeJson("admin-config.json", data),
};
