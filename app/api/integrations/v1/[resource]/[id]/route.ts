import { NextRequest, NextResponse } from 'next/server';
import { openOperationsDb, jsonHash } from '@/lib/operations/db';
import { getRecord, patchDraft, authorizeResource, readPublic } from '@/lib/operations/content';
import { requireIntegration, errorResponse, operationResponse, jsonBody } from '@/lib/operations/http';
import { fail } from '@/lib/operations/core';
export const dynamic = 'force-dynamic';
type Params = {
    params: Promise<{
        resource: string;
        id: string;
    }>;
};
export async function GET(r: NextRequest, { params }: Params) { const db = openOperationsDb(), a = requireIntegration(r, db); if (a instanceof NextResponse)
    return a; try {
    const { resource, id } = await params;
    authorizeResource(db, { type: 'client', id: a.context.clientId, scopes: a.context.scopes, tokenId:a.context.tokenId }, resource, id, 'read');
    const item = getRecord(db, resource, id);
    if (!item)
        fail(404, 'not_found');
    if (!a.context.scopes.includes('content:write')) {
        const row = db.prepare('SELECT published_json,published_version,public_status FROM records WHERE resource=? AND id=?').get(resource, id) as Record<string, any> | undefined;
        if (!row || row.public_status !== 'published')
            fail(404, 'not_found');
        item.data = JSON.parse(String(row.published_json));
        item.version = Number(row.published_version);
        item.etag = jsonHash(item.data);
        item.status = 'published';
    }
    return NextResponse.json(item, { headers: { ETag: '"' + item.etag + '"', 'X-Request-Id': a.requestId, 'Cache-Control': 'no-store' } });
}
catch (e) {
    return errorResponse(e, a.requestId);
} }
export async function PATCH(r: NextRequest, { params }: Params) { const db = openOperationsDb(), a = requireIntegration(r, db); if (a instanceof NextResponse)
    return a; try {
    const { resource, id } = await params;
    return operationResponse(patchDraft(db, resource, id, await jsonBody(r), { type: 'client', id: a.context.clientId, scopes: a.context.scopes, tokenId:a.context.tokenId }, r.headers.get('If-Match') || undefined, r.headers.get('Idempotency-Key') || undefined), a.requestId);
}
catch (e) {
    return errorResponse(e, a.requestId);
} }
