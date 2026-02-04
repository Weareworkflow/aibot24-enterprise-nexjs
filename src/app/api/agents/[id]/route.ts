
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * API oficial para consumir la configuración de un agente.
 * Se utiliza para alimentar bots de voz externos o integraciones.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Inicialización para entorno de servidor
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    const agentRef = doc(db, 'agents', id);
    const agentSnap = await getDoc(agentRef);

    if (!agentSnap.exists()) {
      return NextResponse.json(
        { error: 'Agente no encontrado' },
        { status: 404 }
      );
    }

    const data = agentSnap.data();

    // Estructura limpia para consumo de IA
    return NextResponse.json({
      id: data.id,
      name: data.name,
      role: data.role,
      company: data.company,
      objective: data.objective,
      tone: data.tone,
      instructions: data.knowledge,
      knowledgeFiles: data.knowledgeFiles || [],
      isActive: data.isActive,
      type: data.type
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno', message: error.message },
      { status: 500 }
    );
  }
}
