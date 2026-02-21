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
      return NextResponse.json(
        { error: `Agent with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Fetch global config for prompt compilation
    const config = await db.collection('config-app').findOne({ tenantId: agent.tenantId });
    const globalPrompt = config?.systemPrompt || '';

    // Build compiled prompt: GLOBAL + AGENT SPECIFIC
    let compiledPrompt = '';
    if (globalPrompt) {
      compiledPrompt += globalPrompt.trim() + '\n\n';
    }

    if (agent.systemPrompt) {
      compiledPrompt += agent.systemPrompt.trim();
    } else {
      compiledPrompt += `Eres ${agent.name || 'un agente de IA'}. Tu rol es ${agent.role || 'asistente'}. Empresa: ${agent.company || 'N/A'}.`;
    }

    return NextResponse.json({
      ...agent,
      _id: undefined,
      compiledPrompt: compiledPrompt.trim(),
    });

  } catch (error: any) {
    console.error('[Agent GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDb();

    // Remove fields that shouldn't be updated directly
    const { _id, id: bodyId, ...updates } = body;

    const result = await db.collection('agents').updateOne(
      { id },
      { $set: { ...updates, updatedAt: new Date().toISOString() } }
    ).catch(error => {
      if (error.code === 11000) {
        throw new Error(`Duplicate Bot ID: Another agent in ${updates.tenantId || 'this portal'} is already using botId ${updates.bitrixBotId}`);
      }
      throw error;
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Agent PUT] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    await db.collection('agents').deleteOne({ id });
    // Also delete related metrics
    await db.collection('metrics').deleteOne({ agentId: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Agent DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
