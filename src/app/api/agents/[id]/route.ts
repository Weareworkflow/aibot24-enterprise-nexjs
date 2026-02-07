import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * API oficial para consumir la configuración de un agente.
 * Construye un "Compiled Prompt" concatenando Identidad, Integraciones y Comportamiento.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    const agentRef = doc(db, 'agents', id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return NextResponse.json({ error: 'Agente no encontrado' }, { status: 404 });
    }

    const data = agentSnap.data();

    // 1. Bloque de Identidad
    const identityBlock = `
# IDENTIDAD OPERATIVA
- Nombre: ${data.name}
- Rol: ${data.role}
- Organización: ${data.company}
- Objetivo Crítico: ${data.objective}
- ADN de Comunicación: ${data.tone}
    `.trim();

    // 2. Bloque de Integraciones (Capacidades)
    const activeIntegrations = Object.entries(data.integrations || {})
      .filter(([_, active]) => active)
      .map(([name]) => `- ${name}: Funcionalidad activa en el canal.`);
    
    const integrationsBlock = activeIntegrations.length > 0 
      ? `\n# CAPACIDADES TÉCNICAS ACTIVAS\n${activeIntegrations.join('\n')}` 
      : '';

    // 3. Bloque de Comportamiento (Refinado por chat)
    const behaviorBlock = data.knowledge 
      ? `\n# PROTOCOLO DE COMPORTAMIENTO Y REGLAS\n${data.knowledge}` 
      : '';

    // Concatenación Maestra
    const compiledInstructions = `${identityBlock}${integrationsBlock}${behaviorBlock}`;

    return NextResponse.json({
      id: data.id,
      name: data.name,
      compiledInstructions,
      rawConfig: {
        role: data.role,
        company: data.company,
        objective: data.objective,
        tone: data.tone,
        behavioralManual: data.knowledge
      },
      isActive: data.isActive,
      type: data.type
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Error', message: error.message }, { status: 500 });
  }
}
