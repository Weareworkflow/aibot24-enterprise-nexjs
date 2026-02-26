import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reminderId = searchParams.get('id');
        const tenantId = searchParams.get('tenantId');

        if (!reminderId || !tenantId) {
            return NextResponse.json({ error: 'id and tenantId are required' }, { status: 400 });
        }

        const db = await getDb();
        const reminder = await db.collection('reminders').findOne({
            _id: new ObjectId(reminderId),
            tenant_id: tenantId
        });

        if (!reminder) {
            return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
        }

        return NextResponse.json(reminder);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reminderId = searchParams.get('id');
        const body = await request.json();

        if (!reminderId) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const db = await getDb();
        const { _id, ...updates } = body;

        await db.collection('reminders').updateOne(
            { _id: new ObjectId(reminderId) },
            { $set: { ...updates, updatedAt: new Date().toISOString() } }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const db = await getDb();

        const { tenant_id, chat_id, template_key, variables, scheduled_for, status } = body;

        const reminder = {
            tenant_id,
            chat_id,
            template_key,
            variables,
            scheduled_for: new Date(scheduled_for),
            status: status || 'pending',
            created_at: new Date().toISOString()
        };

        const result = await db.collection('reminders').insertOne(reminder);

        return NextResponse.json({
            success: true,
            id: result.insertedId.toString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
