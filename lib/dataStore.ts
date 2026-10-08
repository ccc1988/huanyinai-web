import {readSubmissions,replaceSubmissions} from "./submissionsStore.ts";
import fs from "fs";
import path from "path";
import { readPublic, legacySave } from "./operations/content.ts";
import { openOperationsDb } from "./operations/db.ts";
import { normalizeSettings, type Customer, type CaseItem, type IndustrySolution, type CapabilityItem, type StatItem, type BlogPost, type Settings, type Contact, type Submission, type SmtpConfig, type AdminConfig } from "./data";

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
  company: () => readPublic<Record<string, string>>("company"),
  customers: () => readPublic<Customer[]>("customers"),
  cases: () => readPublic<CaseItem[]>("cases"),
  industries: () => readPublic<IndustrySolution[]>("industries"),
  capabilities: () => readPublic<CapabilityItem[]>("capabilities"),
  stats: () => readPublic<StatItem[]>("stats"),
  contacts: () => readPublic<Contact[]>("contacts"),
  blogPosts: () => readPublic<BlogPost[]>("blog-posts"),
  settings: () => normalizeSettings(readPublic<Partial<Settings>>("settings")),
  submissions: () => readSubmissions(),
  smtpConfig: () => { try { return readJson<SmtpConfig>("smtp-config.json"); } catch { return { enabled: false, host: "", port: 465, secure: true, username: "", encryptedPassword: null, fromName: "寰引智能官网", fromEmail: "", recipients: [], subjectTemplate: "【新咨询】{company} - {name}" } as SmtpConfig; } },
  adminConfig: () => { try { return readJson<AdminConfig>("admin-config.json"); } catch { return { passwordHash: null, passwordSalt: null, updatedAt: null } as AdminConfig; } },
};

// ===== 写入函数 =====
export const writeData = {
  company: (data: Record<string, string>) => legacySave(openOperationsDb(), "company", data, { type: "admin", id: "session" }),
  customers: (data: Customer[]) => legacySave(openOperationsDb(), "customers", data, { type: "admin", id: "session" }),
  cases: (data: CaseItem[]) => legacySave(openOperationsDb(), "cases", data, { type: "admin", id: "session" }),
  industries: (data: IndustrySolution[]) => legacySave(openOperationsDb(), "industries", data, { type: "admin", id: "session" }),
  capabilities: (data: CapabilityItem[]) => legacySave(openOperationsDb(), "capabilities", data, { type: "admin", id: "session" }),
  stats: (data: StatItem[]) => legacySave(openOperationsDb(), "stats", data, { type: "admin", id: "session" }),
  contacts: (data: Contact[]) => legacySave(openOperationsDb(), "contacts", data, { type: "admin", id: "session" }),
  blogPosts: (data: BlogPost[]) => legacySave(openOperationsDb(), "blog-posts", data, { type: "admin", id: "session" }),
  settings: (data: Settings) => legacySave(openOperationsDb(), "settings", data, { type: "admin", id: "session" }),
  submissions: (data: Submission[]) => replaceSubmissions(data),
  smtpConfig: (data: SmtpConfig) => writeJson("smtp-config.json", data),
  adminConfig: (data: AdminConfig) => writeJson("admin-config.json", data),
};
