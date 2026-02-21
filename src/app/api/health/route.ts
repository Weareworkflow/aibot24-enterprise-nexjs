import { NextResponse } from 'next/server';

/**
 * Endpoint de salud para Kubernetes (Liveness/Readiness probes)
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'aibot24-dashboard'
    });
}
