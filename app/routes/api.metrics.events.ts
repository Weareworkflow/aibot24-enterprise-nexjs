import { type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ request }: LoaderFunctionArgs) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
        return new Response('Missing tenantId', { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const db = await getDb();
            let lastUpdate = new Date().toISOString();
            let isClosed = false;

            const sendEvent = (data: any) => {
                if (isClosed || request.signal.aborted) return;
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch (err) {
                    console.error('[SSE sendEvent] Error:', err);
                    isClosed = true;
                }
            };

            // Initial fetch
            try {
                const metrics = await db.collection('metrics')
                    .find({ agentId: { $regex: new RegExp(`^${tenantId}`) } })
                    .toArray();

                if (metrics.length > 0) {
                    sendEvent(metrics);
                }
            } catch (err) {
                console.error('[SSE Initial Fetch] Error:', err);
            }

            const interval = setInterval(async () => {
                try {
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
            }, 5000);

            request.signal.addEventListener('abort', () => {
                isClosed = true;
                clearInterval(interval);
                try {
                    controller.close();
                } catch (e) {
                    // Ignore
                }
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
