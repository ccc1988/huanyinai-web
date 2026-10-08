import {NextRequest} from 'next/server';import {legacyGet,legacyPut} from '@/lib/operations/legacy';
export const dynamic='force-dynamic';export const GET=(r:NextRequest)=>legacyGet(r,'settings');export const PUT=(r:NextRequest)=>legacyPut(r,'settings');
