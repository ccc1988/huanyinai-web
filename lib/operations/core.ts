import type {DatabaseSync} from 'node:sqlite';
export class OperationsError extends Error { status:number; code:string; details?:unknown; constructor(status:number,code:string,message=code,details?:unknown){super(code);this.name='OperationsError';this.status=status;this.code=code;this.details=details;this.message=message===code?code:message;} }
export function fail(status:number,code:string,details?:unknown):never{throw new OperationsError(status,code,code,details);}
export function inTransaction<T>(db:DatabaseSync,fn:()=>T):T{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}
export function record(value:unknown):Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'invalid_record');return value as Record<string,unknown>;}
export function utcDate(value:unknown,defaultDays=90):string{if(value===undefined)return new Date(Date.now()+defaultDays*86400000).toISOString();if(typeof value!=='string'||!Number.isFinite(Date.parse(value)))fail(400,'invalid_expiry');return new Date(value).toISOString();}
