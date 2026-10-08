import fs from 'node:fs';import path from 'node:path';
import {openOperationsDb,closeOperationsDb,jsonHash} from '../lib/operations/db.ts';
import {initializeContent,RESOURCE_FILES,readPublic} from '../lib/operations/content.ts';
import {recoverPendingOperations} from '../lib/operations/receipt.ts';
const dataDir=process.env.DATA_DIR;if(!dataDir||!path.isAbsolute(dataDir))throw new Error('Explicit absolute DATA_DIR required');
const before=Object.fromEntries(Object.keys(RESOURCE_FILES).filter(r=>fs.existsSync(path.join(dataDir,RESOURCE_FILES[r]))).map(r=>[r,jsonHash(JSON.parse(fs.readFileSync(path.join(dataDir,RESOURCE_FILES[r]),'utf8')))]));
const db=openOperationsDb(dataDir);initializeContent(db,dataDir);recoverPendingOperations(db,dataDir);for(const [r,h] of Object.entries(before))if(jsonHash(readPublic(r,dataDir))!==h)throw new Error('migration_content_changed:'+r);
if(!fs.existsSync(path.join(dataDir,'pages.json')))fs.writeFileSync(path.join(dataDir,'pages.json'),JSON.stringify(readPublic('pages',dataDir),null,2)+'\n',{mode:0o600});
const integrity=db.prepare('PRAGMA integrity_check').get();console.log(JSON.stringify({status:'verified',resources:Object.keys(before).length,publicSnapshotsUnchanged:true,integrity}));closeOperationsDb(dataDir);
