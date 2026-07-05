/**
 * 压缩 contacts.json 中所有 base64 二维码到 200×200 JPEG
 * 使用 sharp，运行方式: DATA_DIR=/path node compress-qr.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const QR_MAX_SIZE = 200;
const DATA_DIR = process.env.DATA_DIR || "/var/www/huanyin_web/shared-data";
const contactsPath = path.join(DATA_DIR, "contacts.json");

console.log("📦 读取:", contactsPath);
const contacts = JSON.parse(fs.readFileSync(contactsPath, "utf-8"));

async function compressBase64Image(b64) {
  const base64Data = b64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  // 用 sharp 压缩：resize 到 200×200（cover 模式裁剪），转 JPEG，白底
  const compressed = await sharp(buffer)
    .resize(QR_MAX_SIZE, QR_MAX_SIZE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .flatten({ background: "#ffffff" }) // 白底，避免透明区域
    .jpeg({ quality: 85 })
    .toBuffer();

  return "data:image/jpeg;base64," + compressed.toString("base64");
}

async function main() {
  let compressedCount = 0;
  let savedBytes = 0;

  for (const contact of contacts) {
    if (!contact.qrCode || !contact.qrCode.startsWith("data:image")) continue;
    const originalSize = contact.qrCode.length;
    try {
      const compressed = await compressBase64Image(contact.qrCode);
      savedBytes += originalSize - compressed.length;
      contact.qrCode = compressed;
      compressedCount++;
      console.log(
        `  ✅ ${contact.name || "未命名"}: ${(originalSize / 1024).toFixed(0)}KB → ${(
          compressed.length / 1024
        ).toFixed(0)}KB`
      );
    } catch (err) {
      console.error(`  ❌ ${contact.name || "未命名"} 压缩失败:`, err.message);
    }
  }

  // 备份原文件
  const backupPath = contactsPath + ".bak";
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(contactsPath, backupPath);
    console.log("💾 原文件已备份:", backupPath);
  }

  fs.writeFileSync(contactsPath, JSON.stringify(contacts, null, 2));
  console.log(
    `\n✅ 完成！压缩 ${compressedCount} 张二维码，节省 ${(savedBytes / 1024 / 1024).toFixed(2)} MB`
  );
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
