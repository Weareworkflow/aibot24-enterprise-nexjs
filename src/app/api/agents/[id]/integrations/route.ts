import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const db = await getDb();

        const agent = await db.collection('agents').findOne({ id });

        if (!agent) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        return NextResponse.json(agent.integrations || []);

    } catch (error: any) {
        console.error('[Integrations GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const integrations = await request.json();
        const db = await getDb();

        if (!Array.isArray(integrations)) {
            return NextResponse.json({ error: 'Integrations must be an array' }, { status: 400 });
        }

        const result = await db.collection('agents').updateOne(
            { id },
            { $set: { integrations, updatedAt: new Date().toISOString() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Integrations PUT] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
