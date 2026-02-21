import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;
        const db = await getDb();

        const installation = await db.collection('installations').findOne({
            $or: [
                { domain: domain },
                { memberId: domain }
            ]
        });

        if (!installation) {
            return NextResponse.json(
                { error: `Installation not found for domain: ${domain}` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            ...installation,
            _id: undefined,
        });
    } catch (error: any) {
        console.error('[Installation GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;
        const body = await request.json();
        const db = await getDb();

        const { _id, domain: _, ...updates } = body;

        await db.collection('installations').updateOne(
            { domain },
            {
                $set: { ...updates, updatedAt: new Date().toISOString() },
                $setOnInsert: { domain }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Installation PUT] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
