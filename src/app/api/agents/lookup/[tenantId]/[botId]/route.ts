import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * lookup API: Encuentra un agente por su Dominio (tenantId) e ID de Bot en Bitrix.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tenantId: string; botId: string }> }
) {
    try {
        const { tenantId, botId } = await params;
        const bitrixBotId = parseInt(botId);

        if (isNaN(bitrixBotId)) {
            return NextResponse.json({ error: 'ID de bot inválido' }, { status: 400 });
        }

        const agentsRef = db.collection('agents');
        const query = agentsRef
            .where('tenantId', '==', tenantId)
            .where('bitrixBotId', '==', bitrixBotId)
            .limit(1);

        const querySnap = await query.get();

        if (querySnap.empty) {
            return NextResponse.json({ error: 'Agente no localizado para este portal y bot' }, { status: 404 });
        }

        const agentDoc = querySnap.docs[0];
        const data = agentDoc.data();

        // Build compiled prompt
        let promptMaster: string;
        if (data.systemPrompt) {
            promptMaster = data.systemPrompt;
        } else {
            promptMaster = `
# IDENTIDAD DEL AGENTE
- Nombre: ${data.name}
- Rol: ${data.role}
- Organización: ${data.company}

Actúa de forma profesional según tu rol.`.trim();
        }

        return NextResponse.json({
            success: true,
            agentId: agentDoc.id,
            promptMaster: promptMaster.trim(),
            config: {
                isActive: data.isActive,
                color: data.color,
                bitrixBotId: data.bitrixBotId,
                avatar: data.avatar,
                company: data.company,
                createdAt: data.createdAt
            }
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error: any) {
        console.error("Error en API Agents Lookup:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
