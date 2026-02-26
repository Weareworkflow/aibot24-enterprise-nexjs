import { NextRequest, NextResponse } from 'next/server';
import { AutomationsService } from '@/lib/automations-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'Missing tenantId parameter' }, { status: 400 });
        }

        const templates = await AutomationsService.listByTenant(tenantId);
        return NextResponse.json(templates);
    } catch (error: any) {
        console.error('[Automations List] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const id = await AutomationsService.create(body);

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('[Automations POST] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
