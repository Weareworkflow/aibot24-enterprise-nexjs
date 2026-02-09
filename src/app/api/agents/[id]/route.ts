
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

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

    const agentRef = doc(db, 'agents', id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return NextResponse.json({ error: 'Unidad no localizada' }, { status: 404 });
    }

    const data = agentSnap.data();

    // 1. Capa de Identidad (Core)
    const identityBlock = `
# IDENTIDAD DEL AGENTE
- Nombre: ${data.name}
- Rol: ${data.role}
- Organización: ${data.company}
- Tono Requerido: ${data.tone}
- Objetivo Crítico: ${data.objective}
    `.trim();

    // 2. Capa de Capacidades (Integraciones)
    const activeIntegrations = Object.entries(data.integrations || {})
      .filter(([_, active]) => active)
      .map(([name]) => `- ${name}`);
    
    const capabilitiesBlock = activeIntegrations.length > 0 
      ? `\n# CAPACIDADES Y HERRAMIENTAS ACTIVAS\n${activeIntegrations.join('\n')}` 
      : '';

    // 3. Capa de Comportamiento (Refinado por Chat)
    const protocolBlock = data.knowledge 
      ? `\n# PROTOCOLO DE COMPORTAMIENTO (MANUAL TÉCNICO)\n${data.knowledge}` 
      : '\n# PROTOCOLO DE COMPORTAMIENTO\nActúa de forma profesional según tu rol y objetivo.';

    // Compilación Final
    const promptMaster = `${identityBlock}${capabilitiesBlock}${protocolBlock}`;

    return NextResponse.json({
      success: true,
      agentId: data.id,
      promptMaster,
      config: {
        isActive: data.isActive,
        color: data.color,
        createdAt: data.createdAt
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
