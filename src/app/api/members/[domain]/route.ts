import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { AIBotMember } from '@/lib/types';

/**
 * Handle listing and adding members to a portal.
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;
        const db = await getDb();

        const members = await db.collection('members')
            .find({ domain })
            .toArray();

        return NextResponse.json(members.map(m => ({ ...m, _id: undefined })));
    } catch (error: any) {
        console.error('[Members GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;
        const body = await request.json();
        const db = await getDb();

        const { userId, userName, role } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const memberIdKey = `${domain}-${userId}`;

        const member: Partial<AIBotMember> = {
            id: memberIdKey,
            userId,
            userName: userName || `User ${userId}`,
            domain,
            role: role || 'viewer',
            addedAt: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        };

        await db.collection('members').updateOne(
            { id: memberIdKey },
            { $set: member },
            { upsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Members POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        const db = await getDb();
        const memberIdKey = `${domain}-${userId}`;

        await db.collection('members').deleteOne({ id: memberIdKey });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Members DELETE] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
