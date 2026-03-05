import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";
import { unregisterBitrixBot, updateBitrixBot } from "@/lib/bitrix-service";
import { AIAgent } from "@/lib/types";

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
            ) as unknown as AIAgent;

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

            // 2. Sincronizar con Bitrix si cambian campos de identidad relevantes
            if (result.bitrixBotId && result.tenantId && (updates.name || updates.role || updates.avatar || updates.color)) {
                try {
                    await updateBitrixBot(result.tenantId, result);
                    console.log(`[API Agents] Bot ${result.bitrixBotId} synced with Bitrix`);
                } catch (bitrixError) {
                    console.error("[API Agents] Bitrix Sync Error:", bitrixError);
                    // No fallamos la petición si falla Bitrix, pero lo logueamos
                }
            }

            return json(result);
        } catch (error: any) {
            console.error("[API Agents PUT] Error:", error);
            return json({ error: error.message }, { status: 500 });
        }
    }

    if (request.method === "DELETE") {
        try {
            const agent = await db.collection("agents").findOne({ id: agentId });
            if (!agent) return json({ error: "Not found" }, { status: 404 });

            // 1. Desvincular de Bitrix si tiene ID
            if (agent.bitrixBotId && agent.tenantId) {
                try {
                    await unregisterBitrixBot(agent.tenantId, agent.bitrixBotId.toString());
                    console.log(`[API Agents] Bot ${agent.bitrixBotId} unregistered from Bitrix`);
                } catch (bitrixError) {
                    console.error("[API Agents] Bitrix Unregister Error:", bitrixError);
                    // Continuamos para borrar de la DB local
                }
            }

            // 2. Eliminar de MongoDB
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
