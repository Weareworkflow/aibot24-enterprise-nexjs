import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const { agentId, metrics: metricsData } = body;

        if (!agentId) {
            return json({ error: "Missing agentId" }, { status: 400 });
        }

        const updates = metricsData || {};
        const db = await getDb();

        // Remove agentId from updates to avoid overwriting or redundant fields
        const { agentId: _, ...cleanUpdates } = updates;

        await db.collection("metrics").updateOne(
            { agentId },
            {
                $set: {
                    ...cleanUpdates,
                    updatedAt: new Date().toISOString()
                },
                $setOnInsert: { agentId }
            },
            { upsert: true }
        );

        return json({ success: true });
    } catch (error: any) {
        console.error("[Metrics POST] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
