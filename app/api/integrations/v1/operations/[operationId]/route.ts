import { NextRequest, NextResponse } from 'next/server';
import { openOperationsDb } from '@/lib/operations/db';
import { getOperation } from '@/lib/operations/receipt';
import { requireIntegration, errorResponse } from '@/lib/operations/http';
import { fail } from '@/lib/operations/core';
export const dynamic = 'force-dynamic';
export async function GET(r: NextRequest, { params }: {
    params: Promise<{
        operationId: string;
    }>;
}) { const db = openOperationsDb(), a = requireIntegration(r, db); if (a instanceof NextResponse)
    return a; try {
    const { operationId } = await params, op = getOperation(db, operationId);
    const row = db.prepare('SELECT actor_type,actor_id FROM operations WHERE id=?').get(operationId) as Record<string, any> | undefined;
    if (!op || row?.actor_type !== 'client' || row.actor_id !== a.context.clientId)
        fail(404, 'not_found');
    return NextResponse.json(op, { headers: { 'Cache-Control': 'no-store' } });
}
catch (e) {
    return errorResponse(e, a.requestId);
} }
