import { NextRequest, NextResponse } from 'next/server';
import { AutomationsService } from '@/lib/automations-service';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        let template = await AutomationsService.getById(id);

        if (!template && tenantId) {
            // Try lookup by key if ID fails and tenantId is provided
            template = await AutomationsService.getByKey(tenantId, id);
        }

        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        const success = await AutomationsService.update(id, body);
        return NextResponse.json({ success });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const success = await AutomationsService.delete(id);

        return NextResponse.json({ success });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
