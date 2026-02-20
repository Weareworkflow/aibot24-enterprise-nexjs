import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * API para consultar detalles de instalación por dominio.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ domain: string }> }
) {
    try {
        const { domain } = await params;

        const installRef = db.collection('installations').doc(domain);
        const installSnap = await installRef.get();

        if (!installSnap.exists) {
            return NextResponse.json({ error: 'Instalación no encontrada' }, { status: 404 });
        }

        const data = installSnap.data() as any;

        return NextResponse.json({
            success: true,
            domain: data.domain,
            status: data.status,
            memberId: data.memberId,
            expiresAt: data.expiresAt,
            // Se incluyen credenciales para uso interno del motor de agentes
            credentials: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                clientId: data.clientId,
                clientSecret: data.clientSecret
            }
        });
    } catch (error: any) {
        console.error("Error en API Installations:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
