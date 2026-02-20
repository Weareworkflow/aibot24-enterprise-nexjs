import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';

/**
 * API para que los agentes envíen métricas de rendimiento.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agentId, metrics } = body;

        if (!agentId) {
            return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
        }

        const metricsRef = db.collection('metrics').doc(agentId);

        // Update with merge to preserve historical fields if any
        await metricsRef.set({
            ...metrics,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        return NextResponse.json({
            success: true,
            message: 'Métricas actualizadas correctamente'
        });
    } catch (error: any) {
        console.error("Error en API Metrics:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
