import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";
import { registerBitrixBot } from "@/lib/bitrix-service";
import { generateAgentConfig } from "@/ai/flows/generate-agent-config";
import { AIAgent } from "@/lib/types";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { domain, config } = await request.json();
        const db = await getDb();

        // 1. Check duplicate
        const existingByName = await db.collection("agents").findOne({
            tenantId: domain,
            name: config.name,
        });

        if (existingByName) {
            return json({ error: `Ya existe un agente con el nombre "${config.name}" en este portal.` }, { status: 400 });
        }

        // 2. Register bot in Bitrix24
        const normalizedDomain = domain.split('.')[0].substring(0, 15);
        const cleanName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
        const deterministicId = `bot_${cleanName}_${normalizedDomain}`;

        const bitrixResult = await registerBitrixBot(domain, {
            name: config.name,
            role: config.role,
            color: config.color,
            id: deterministicId
        } as any);

        if (bitrixResult.error || !bitrixResult.result) {
            throw new Error(bitrixResult.error_description || "Error registrando bot en Bitrix24");
        }

        const botIdToUse = bitrixResult.result as number;
        const finalAgentId = `${domain}-${botIdToUse}`;

        // 3. AI Prompt
        const aiResponse = await generateAgentConfig({
            prompt: `Genera un objetivo estratégico breve y un tono de comunicación para un agente con el rol: ${config.role} de la empresa ${config.company}.`,
            tenantId: domain
        });

        // 4. Save to MongoDB
        const newAgent: AIAgent = {
            id: finalAgentId,
            tenantId: domain,
            name: config.name,
            type: 'text',
            role: config.role,
            company: config.company,
            systemPrompt: aiResponse.systemPrompt || "",
            color: config.color,
            isActive: true,
            bitrixBotId: botIdToUse,
            bitrixBotCode: deterministicId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await db.collection("agents").insertOne(newAgent);

        // 5. Initialize Metrics
        await db.collection("metrics").insertOne({
            agentId: finalAgentId,
            usageCount: 0,
            performanceRating: 100,
            totalInteractionMetric: 0,
            tokens: "0",
            meetings: 0,
            transfers: 0,
            abandoned: 0,
            createdAt: new Date().toISOString(),
        });

        // 6. Audit Log
        await db.collection("audit_logs").insertOne({
            tenantId: domain,
            action: "DEPLOY_AGENT",
            entityType: "AGENT",
            entityId: finalAgentId,
            details: { name: config.name, role: config.role },
            timestamp: new Date().toISOString()
        });

        return json({ success: true, agentId: finalAgentId });

    } catch (error: any) {
        console.error("[Deploy Action] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
