import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ params }: LoaderFunctionArgs) {
    try {
        const agentId = params.agentId;
        if (!agentId) {
            return json({ error: "Missing agentId" }, { status: 400 });
        }

        const db = await getDb();
        const metrics = await db.collection("metrics").findOne({ agentId });

        return json(metrics ? { ...metrics, _id: undefined } : {
            agentId,
            usageCount: 0,
            performanceRating: 0,
            totalInteractionMetric: 0,
        });
    } catch (error: any) {
        console.error("[Metrics GET] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
