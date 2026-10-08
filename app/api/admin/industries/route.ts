import {NextRequest} from 'next/server';import {legacyGet,legacyPut,legacyDelete} from '@/lib/operations/legacy';
export const dynamic='force-dynamic';export const GET=(r:NextRequest)=>legacyGet(r,'industries');export const PUT=(r:NextRequest)=>legacyPut(r,'industries');export const DELETE=(r:NextRequest)=>legacyDelete(r,'industries');
