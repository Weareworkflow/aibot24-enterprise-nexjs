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
    const globalPromptRegistered = config?.systemPromptRegistered || '';

    // Function to build compiled prompt
    const compile = (global: string, specific: string, fallback: string) => {
      let result = '';
      if (global) result += global.trim() + '\n\n';
      if (specific) result += specific.trim();
      else result += fallback;
      return result.trim();
    };

    const fallback = `Eres ${agent.name || 'un agente de IA'}. Tu rol es ${agent.role || 'asistente'}. Empresa: ${agent.company || 'N/A'}.`;

    const compiledPrompt = compile(globalPrompt, agent.systemPrompt, fallback);
    const compiledPromptRegistered = compile(
      globalPromptRegistered || globalPrompt,
      agent.systemPromptRegistered || agent.systemPrompt,
      fallback
    );

    return NextResponse.json({
      ...agent,
      _id: undefined,
      compiledPrompt,
      compiledPromptRegistered,
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

    // --- Cache Invalidation ---
    try {
      const agentInternalUrl = process.env.AGENT_INTERNAL_URL;
      if (agentInternalUrl) {
        const agent = await db.collection('agents').findOne({ id });
        if (agent) {
          const identifier = `${agent.tenantId}-${agent.bitrixBotId}`;
          console.log(`[Agent PUT] Triggering cache invalidation for: ${identifier}`);

          fetch(`${agentInternalUrl}/api/cache/invalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agent_id: identifier,
              type: 'config'
            })
          }).catch(err => console.error('[Agent PUT] Cache invalidation fetch error:', err));
        }
      }
    } catch (cacheErr) {
      console.error('[Agent PUT] Cache invalidation logic error:', cacheErr);
    }
    // --------------------------

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
