import {NextRequest} from 'next/server';import {requireAdmin,adminResponse} from '@/lib/operations/admin';import {listAudit} from '@/lib/operations/content';import {openOperationsDb} from '@/lib/operations/db';
export const dynamic='force-dynamic';export function GET(r:NextRequest){const no=requireAdmin(r);if(no)return no;return adminResponse(r,{items:listAudit(openOperationsDb(),100)});}
