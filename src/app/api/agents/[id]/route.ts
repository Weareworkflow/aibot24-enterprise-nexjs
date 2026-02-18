import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * API oficial de AIBot24 para el motor de ejecución.
 * Entrega el prompt compilado jerárquico utilizando el singleton del servidor.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const agentRef = db.collection('agents').doc(id);
    const agentSnap = await agentRef.get();

    if (!agentSnap.exists) {
      return NextResponse.json({ error: 'Unidad no localizada' }, { status: 404 });
    }

    const data = agentSnap.data() as any;

    // Build compiled prompt
    // Priority: systemPrompt (full override), else identity-based fallback
    let promptMaster: string;

    if (data.systemPrompt) {
      promptMaster = data.systemPrompt;
    } else {
      // Fallback: minimal identity block
      promptMaster = `
# IDENTIDAD DEL AGENTE
- Nombre: ${data.name}
- Rol: ${data.role}
- Organización: ${data.company}

Actúa de forma profesional según tu rol.`.trim();
    }

    return NextResponse.json({
      success: true,
      agentId: agentSnap.id,
      promptMaster,
      config: {
        isActive: data.isActive,
        color: data.color,
        createdAt: data.createdAt
      }
    });
  } catch (error: any) {
    console.error("Error en API Agents:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
