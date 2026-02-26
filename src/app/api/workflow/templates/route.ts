import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
        }

        const db = await getDb();
        const templates = await db.collection('notification_templates')
            .find({ tenant_id: tenantId })
            .toArray();

        return NextResponse.json(templates);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenant_id, key, content, variables, active } = body;

        if (!tenant_id || !key) {
            return NextResponse.json({ error: 'Missing tenant_id or key' }, { status: 400 });
        }

        const db = await getDb();

        await db.collection('notification_templates').updateOne(
            { tenant_id, key },
            {
                $set: {
                    content,
                    variables,
                    active: active ?? true,
                    updatedAt: new Date().toISOString()
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
