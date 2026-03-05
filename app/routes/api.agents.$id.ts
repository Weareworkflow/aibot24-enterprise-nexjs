import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ params }: LoaderFunctionArgs) {
    const agentId = params.id;
    const db = await getDb();
    const agent = await db.collection("agents").findOne({ id: agentId });

    if (!agent) {
        return json({ error: "Agent not found" }, { status: 404 });
    }

    return json({
        ...agent,
        _id: agent._id.toString(),
    });
}

export async function action({ request, params }: ActionFunctionArgs) {
    const agentId = params.id;
    const db = await getDb();

    if (request.method === "PUT") {
        try {
            const updates = await request.json();

            // Validation could go here (AIAgentSchema.partial().parse(updates))

            const result = await db.collection("agents").findOneAndUpdate(
                { id: agentId },
                {
                    $set: {
                        ...updates,
                        updatedAt: new Date().toISOString()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!result) {
                return json({ error: "Agent not found" }, { status: 404 });
            }

            // Audit Log
            await db.collection("audit_logs").insertOne({
                tenantId: result.tenantId,
                action: "UPDATE_AGENT",
                entityType: "AGENT",
                entityId: agentId as string,
                details: updates,
                timestamp: new Date().toISOString()
            });

            return json(result);
        } catch (error: any) {
            return json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === "DELETE") {
        try {
            const agent = await db.collection("agents").findOne({ id: agentId });
            if (!agent) return json({ error: "Not found" }, { status: 404 });

            await db.collection("agents").deleteOne({ id: agentId });

            // Audit Log
            await db.collection("audit_logs").insertOne({
                tenantId: agent.tenantId,
                action: "DELETE_AGENT",
                entityType: "AGENT",
                entityId: agentId as string,
                details: { name: agent.name },
                timestamp: new Date().toISOString()
            });

            return json({ success: true });
        } catch (error: any) {
            return json({ error: error.message }, { status: 500 });
        }
    }

    return json({ error: "Method not allowed" }, { status: 405 });
}
