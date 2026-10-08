import {DatabaseSync} from 'node:sqlite';
import {createHash,randomUUID} from 'node:crypto';
import fs from 'node:fs';import path from 'node:path';
import {getDataDir,getOperationsDbPath,ensureOperationsDirs} from './config.ts';
const cache=new Map<string,DatabaseSync>();
export function addColumn(db:DatabaseSync,table:string,name:string,definition:string){if(!(db.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[]).some(x=>x.name===name))db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);}
export function openOperationsDb(dataDir=getDataDir()):DatabaseSync{const file=getOperationsDbPath(dataDir);const old=cache.get(file);if(old)return old;ensureOperationsDirs(dataDir);const db=new DatabaseSync(file);db.exec(`PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON;PRAGMA busy_timeout=10000;
CREATE TABLE IF NOT EXISTS clients(id TEXT PRIMARY KEY,name TEXT NOT NULL,scopes TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,last_used_at TEXT);
CREATE TABLE IF NOT EXISTS secrets(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),secret_hash TEXT NOT NULL,fingerprint TEXT NOT NULL,expires_at TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL,revoked_at TEXT);
CREATE TABLE IF NOT EXISTS tokens(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),secret_id TEXT NOT NULL REFERENCES secrets(id),token_hash TEXT UNIQUE NOT NULL,fingerprint TEXT NOT NULL,scopes TEXT NOT NULL,issued_at TEXT NOT NULL,expires_at TEXT NOT NULL,revoked_at TEXT);
CREATE TABLE IF NOT EXISTS records(resource TEXT NOT NULL,id TEXT NOT NULL,status TEXT NOT NULL,version INTEGER NOT NULL,data_json TEXT NOT NULL,etag TEXT NOT NULL,deleted_at TEXT,updated_at TEXT NOT NULL,PRIMARY KEY(resource,id));
CREATE TABLE IF NOT EXISTS revisions(resource TEXT NOT NULL,id TEXT NOT NULL,revision INTEGER NOT NULL,status TEXT NOT NULL,data_json TEXT NOT NULL,etag TEXT NOT NULL,created_at TEXT NOT NULL,created_by TEXT NOT NULL,PRIMARY KEY(resource,id,revision));
CREATE TABLE IF NOT EXISTS operations(id TEXT PRIMARY KEY,resource TEXT NOT NULL,resource_id TEXT NOT NULL,action TEXT NOT NULL,status TEXT NOT NULL,before_hash TEXT,after_hash TEXT,idempotency_key TEXT,request_hash TEXT,error_code TEXT,error_message TEXT,created_at TEXT NOT NULL,completed_at TEXT);
CREATE TABLE IF NOT EXISTS audit(id TEXT PRIMARY KEY,actor_type TEXT NOT NULL,actor_id TEXT NOT NULL,action TEXT NOT NULL,resource TEXT,resource_id TEXT,metadata_json TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS idempotency(client_id TEXT NOT NULL,idempotency_key TEXT NOT NULL,request_hash TEXT NOT NULL,operation_id TEXT NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(client_id,idempotency_key));
CREATE TABLE IF NOT EXISTS rate_limits(client_id TEXT NOT NULL,window_start INTEGER NOT NULL,request_count INTEGER NOT NULL,PRIMARY KEY(client_id,window_start));
CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,filename TEXT NOT NULL,mime TEXT NOT NULL,bytes INTEGER NOT NULL,path TEXT NOT NULL,version INTEGER NOT NULL,status TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projections(resource TEXT PRIMARY KEY,data_json TEXT NOT NULL,generation INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS outbox(operation_id TEXT PRIMARY KEY,resource TEXT NOT NULL,data_json TEXT NOT NULL,generation INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending');
CREATE TABLE IF NOT EXISTS policy(key TEXT PRIMARY KEY,value TEXT NOT NULL);
`);
for(const [name,def] of [['expires_at','TEXT'],['resources',"TEXT NOT NULL DEFAULT '*'"] ,['resource_ids',"TEXT NOT NULL DEFAULT '{}'"],['auto_publish','INTEGER NOT NULL DEFAULT 0'],['rate_limit','INTEGER NOT NULL DEFAULT 120'],['token_minutes','INTEGER NOT NULL DEFAULT 30']] as const)addColumn(db,'clients',name,def);
for(const [name,def] of [['published_json','TEXT'],['published_version','INTEGER'],['public_status',"TEXT NOT NULL DEFAULT 'unpublished'"],['position','INTEGER NOT NULL DEFAULT 0'],['approved_version','INTEGER']] as const)addColumn(db,'records',name,def);
for(const [name,def] of [['actor_type',"TEXT NOT NULL DEFAULT 'admin'"],['actor_id',"TEXT NOT NULL DEFAULT 'session'"]] as const)addColumn(db,'operations',name,def);
fs.chmodSync(file,0o600);cache.set(file,db);return db;}
export function resetOperationsDb(dataDir:string){const p=getOperationsDbPath(dataDir);cache.get(p)?.close();cache.delete(p);for(const suffix of ['', '-wal','-shm'])try{fs.unlinkSync(p+suffix);}catch{}}
export function closeOperationsDb(dataDir=getDataDir()){const p=getOperationsDbPath(dataDir);cache.get(p)?.close();cache.delete(p);}
function canonical(x:unknown):unknown{if(Array.isArray(x))return x.map(canonical);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));return x;}
export function jsonHash(x:unknown){return createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');}
export function stableJson(x:unknown){return JSON.stringify(x);}
export function nowIso(){return new Date().toISOString();}export function newId(prefix:string){return `${prefix}_${randomUUID()}`;}
export function readJsonFile<T>(dir:string,name:string):T{return JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));}
export function writeJsonFileAtomic(dir:string,name:string,x:unknown){const dest=path.join(dir,name),temp=dest+'.'+randomUUID()+'.tmp';const fd=fs.openSync(temp,'wx',0o600);try{fs.writeFileSync(fd,JSON.stringify(x,null,2)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}try{fs.renameSync(temp,dest);const d=fs.openSync(dir,'r');try{fs.fsyncSync(d);}finally{fs.closeSync(d);}}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
