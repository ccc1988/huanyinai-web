import { createCipheriv, createDecipheriv, scryptSync, randomBytes, timingSafeEqual } from "crypto";

const ALGO = "aes-256-gcm";
// 密钥派生来源：ADMIN_SESSION_SECRET（与 auth.ts 共享同一密钥源）
const SECRET = process.env.ADMIN_SESSION_SECRET || "huanyin-admin-dev-secret";

function deriveKey(): Buffer {
  return scryptSync(SECRET, "huanyin-smtp-salt", 32);
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encrypt(plaintext: string): EncryptedData {
  const key = deriveKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(data: EncryptedData): string {
  const key = deriveKey();
  const decipher = createDecipheriv(ALGO, key, Buffer.from(data.iv, "hex"));
  decipher.setAuthTag(Buffer.from(data.tag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data.encrypted, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function encryptToString(plaintext: string): string {
  return JSON.stringify(encrypt(plaintext));
}

export function decryptFromString(jsonStr: string): string {
  try {
    const data = JSON.parse(jsonStr) as EncryptedData;
    return decrypt(data);
  } catch {
    return "";
  }
}

// ===== 密码哈希（scrypt + salt，符合 OWASP 标准）=====

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyHash(password: string, hash: string, salt: string): boolean {
  try {
    const computed = scryptSync(password, salt, 64);
    const stored = Buffer.from(hash, "hex");
    return computed.length === stored.length && timingSafeEqual(computed, stored);
  } catch {
    return false;
  }
}
