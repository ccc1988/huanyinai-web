import fs from 'node:fs';
import path from 'node:path';
export function getDataDir(){return process.env.DATA_DIR||path.join(process.cwd(),'data');}
export function getMediaDir(){return process.env.MEDIA_DIR||path.join(getDataDir(),'media');}
export function getOperationsDbPath(dataDir=getDataDir()){return path.join(dataDir,'operations.sqlite3');}
export function ensureOperationsDirs(dataDir=getDataDir()){fs.mkdirSync(dataDir,{recursive:true,mode:0o700});}
export function isOperationsEnabled(){return process.env.OPERATIONS_API_ENABLED==='true';}
export const ACCESS_TOKEN_DURATIONS=new Set([15,30,60]);
export const DEFAULT_ACCESS_TOKEN_MINUTES=30,DEFAULT_SECRET_DAYS=90,MAX_REQUESTS_PER_MINUTE=120,MAX_MEDIA_BYTES=10*1024*1024;
export const SCOPES=['content:read','content:write','content:publish','media:read','media:write','analytics:read','submissions:read'] as const;
export type Scope=typeof SCOPES[number];
export function parseScopes(value:string|undefined|null){return [...new Set((value||'').split(/[\s,]+/).filter(Boolean))];}
export function assertScopes(scopes:string[]){if(!Array.isArray(scopes)||scopes.some(s=>!(SCOPES as readonly string[]).includes(s)))throw new Error('invalid_scope');}
