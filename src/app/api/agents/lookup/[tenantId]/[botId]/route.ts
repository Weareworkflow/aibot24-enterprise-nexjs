import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string; botId: string }> }
) {
    try {
        const { tenantId, botId } = await params;
        const db = await getDb();

        const agent = await db.collection('agents').findOne({
            tenantId,
            bitrixBotId: parseInt(botId),
        });

        if (!agent) {
            return NextResponse.json(
                { error: `Agent not found for tenant ${tenantId} and botId ${botId}` },
                { status: 404 }
            );
        }

        // Fetch global config for prompt compilation
        const config = await db.collection('config-app').findOne({ tenantId });
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
        console.error('[Agent Lookup] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
