import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflow/validate
 * Validates stop conditions for a workflow.
 * Query params: tenantId, userId, field, value
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const userId = searchParams.get('userId');
        const field = searchParams.get('field');
        const expectedValue = searchParams.get('value');

        if (!tenantId || !userId) {
            return NextResponse.json({ error: 'Missing tenantId or userId' }, { status: 400 });
        }

        const db = await getDb();

        // If no stop condition is provided, it's valid to continue
        if (!field) {
            return NextResponse.json({ shouldNotify: true });
        }

        // We search in 'contacts' or 'leads'. For now, let's look in 'contacts'.
        // We also check 'members' just in case.
        const user = await db.collection('contacts').findOne({
            $or: [
                { id: userId },
                { bitrixId: userId },
                { bitrix_id: userId }
            ]
        });

        if (user) {
            const currentValue = user[field];
            // Compare as string to handle simple cases, or more complex logic if needed
            if (String(currentValue) === String(expectedValue)) {
                return NextResponse.json({
                    shouldNotify: false,
                    reason: `Stop condition met: ${field} is ${currentValue}`
                });
            }
        }

        return NextResponse.json({ shouldNotify: true });
    } catch (error: any) {
        console.error('[Workflow Validate] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
