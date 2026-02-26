import { NextRequest, NextResponse } from 'next/server';
import { TriggersService } from '@/lib/triggers-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
        }

        const triggers = await TriggersService.listByTenant(tenantId);
        return NextResponse.json(triggers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.tenantId || !data.nombre || !data.evento || !data.plantillaKey) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = await TriggersService.create(data);
        return NextResponse.json({ id, message: 'Trigger created successfully' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
