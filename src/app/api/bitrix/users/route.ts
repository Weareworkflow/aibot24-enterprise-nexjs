import { NextRequest, NextResponse } from 'next/server';
import { callBitrixMethod } from '@/lib/bitrix-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const search = searchParams.get('search');

        if (!tenantId) {
            return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });
        }

        const params: any = {
            ACTIVE: 'Y',
            USER_TYPE: 'employee',
        };

        if (search) {
            params.FIND = search;
        }

        const result = await callBitrixMethod(tenantId, 'user.get', params);

        if (result.error) {
            return NextResponse.json({ error: result.error_description || result.error }, { status: 500 });
        }

        // Map to a simpler format for the frontend
        const users = (result.result || []).map((user: any) => ({
            id: user.ID,
            name: `${user.NAME} ${user.LAST_NAME}`.trim(),
            email: user.EMAIL,
            workPosition: user.WORK_POSITION,
            avatar: user.PERSONAL_PHOTO,
        }));

        return NextResponse.json(users);

    } catch (error: any) {
        console.error('[Bitrix Users GET] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
    }
}
