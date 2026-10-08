import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { readPublic } from "../lib/operations/content.ts";
import { closeOperationsDb } from "../lib/operations/db.ts";
import { DEFAULT_PAGES } from "../lib/content/defaultPages.ts";
import { validatePage, validatePagesData } from "../lib/content/pageSchema.ts";
import { getPage } from "../lib/content/pages.ts";
const hash=(filename:string)=>createHash("sha256").update(fs.readFileSync(filename)).digest("hex");

test("all default pages validate natively (without a TS transpile adapter)",()=>{
  assert.equal(validatePagesData(DEFAULT_PAGES),DEFAULT_PAGES);
  for(const page of DEFAULT_PAGES)assert.equal(validatePage(page),page);
});

test("real public reader uses published JSON/default fallback without creating DB or files",()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"hy-w3-public-json-"));
  try {
    assert.deepEqual(readPublic("pages",dir),DEFAULT_PAGES);
    assert.deepEqual(fs.readdirSync(dir),[]);
    const pages=structuredClone(DEFAULT_PAGES);
    pages[0].blocks.find(b=>b.id==="home-hero")!.props.titlePrimary="W3_REAL_PUBLISHED_JSON";
    const filename=path.join(dir,"pages.json");fs.writeFileSync(filename,JSON.stringify(pages));
    const before=hash(filename);
    assert.equal(getPage("home",dir)!.blocks[0].props.titlePrimary,"W3_REAL_PUBLISHED_JSON");
    assert.equal(hash(filename),before);
    assert.deepEqual(fs.readdirSync(dir),["pages.json"]);
  } finally {closeOperationsDb(dir);fs.rmSync(dir,{recursive:true,force:true});}
});

test("real SQLite public snapshot reader does not migrate, chmod, seed or create WAL/files",()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"hy-w3-public-snapshot-"));
  const filename=path.join(dir,"operations.sqlite3");
  try {
    // A published-snapshot-only DB deliberately has no management tables/migrations.
    const fixture=new DatabaseSync(filename);
    fixture.exec("CREATE TABLE projections(resource TEXT PRIMARY KEY,data_json TEXT NOT NULL)");
    const pages=structuredClone(DEFAULT_PAGES);
    pages[0].blocks.find(b=>b.id==="home-hero")!.props.titlePrimary="W3_REAL_SQLITE_SNAPSHOT";
    fixture.prepare("INSERT INTO projections VALUES(?,?)").run("pages",JSON.stringify(pages));
    fixture.close();fs.chmodSync(filename,0o640);
    const before={hash:hash(filename),mode:fs.statSync(filename).mode,files:fs.readdirSync(dir).sort()};
    const page=getPage("home",dir)!;
    assert.equal(page.blocks[0].props.titlePrimary,"W3_REAL_SQLITE_SNAPSHOT");
    closeOperationsDb(dir);
    assert.equal(hash(filename),before.hash,"public read changed SQLite bytes");
    assert.equal(fs.statSync(filename).mode,before.mode,"public read changed file permissions");
    assert.deepEqual(fs.readdirSync(dir).sort(),before.files,"public read created auxiliary files");
    const observer=new DatabaseSync(filename,{readOnly:true});
    try {assert.deepEqual(observer.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all().map((row:any)=>row.name),["projections"]);}finally{observer.close();}
  } finally {closeOperationsDb(dir);fs.rmSync(dir,{recursive:true,force:true});}
});
