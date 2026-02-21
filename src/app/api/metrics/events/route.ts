import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
        return new Response('Missing tenantId', { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const db = await getDb();
            let lastUpdate = '';

            const sendEvent = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            // Initial fetch
            try {
                const metrics = await db.collection('metrics')
                    .find({ agentId: { $regex: new RegExp(`^${tenantId}`) } })
                    .toArray();

                if (metrics.length > 0) {
                    sendEvent(metrics);
                    lastUpdate = new Date().toISOString();
                }
            } catch (err) {
                console.error('[SSE Initial Fetch] Error:', err);
            }

            const interval = setInterval(async () => {
                try {
                    // Optimized check: find if anything updated since last poll
                    const updatedMetrics = await db.collection('metrics')
                        .find({
                            agentId: { $regex: new RegExp(`^${tenantId}`) },
                            updatedAt: { $gt: lastUpdate }
                        })
                        .toArray();

                    if (updatedMetrics.length > 0) {
                        sendEvent(updatedMetrics);
                        lastUpdate = new Date().toISOString();
                    }
                } catch (err) {
                    console.error('[SSE Poll] Error:', err);
                }
            }, 5000); // 5 seconds interval for balance between real-time and server load

            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
