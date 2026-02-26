import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'Missing tenantId parameter' }, { status: 400 });
        }

        const db = await getDb();

        const filter: Record<string, any> = { tenantId };

        const agents = await db.collection('agents')
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();

        // Strip MongoDB internal _id
        const cleaned = agents.map(({ _id, ...rest }) => rest);

        return NextResponse.json(cleaned);
    } catch (error: any) {
        console.error('[Agents List] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const db = await getDb();

        const agentData = {
            ...body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const { id, createdAt, ...updates } = agentData;

        // Check for duplicate name in the same tenant
        const existingByName = await db.collection('agents').findOne({
            tenantId: agentData.tenantId,
            name: agentData.name,
            id: { $ne: id } // Exclude the current agent if it's an update
        });

        if (existingByName) {
            return NextResponse.json(
                { error: `Ya existe un agente con el nombre "${agentData.name}" en este portal.` },
                { status: 400 }
            );
        }

        await db.collection('agents').updateOne(
            { id },
            {
                $set: { ...updates, updatedAt: new Date().toISOString() },
                $setOnInsert: { id, createdAt }
            },
            { upsert: true }
        ).catch(error => {
            if (error.code === 11000) {
                throw new Error(`Duplicate Bot ID: Another agent in ${agentData.tenantId || 'this portal'} is already using botId ${agentData.bitrixBotId}`);
            }
            throw error;
        });

        return NextResponse.json({ success: true, id: agentData.id });
    } catch (error: any) {
        console.error('[Agents POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
