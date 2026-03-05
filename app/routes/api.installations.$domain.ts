import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ params }: LoaderFunctionArgs) {
    const domain = params.domain; // This comes from api.installations.$domain.ts
    if (!domain) return json({ error: "Missing domain" }, { status: 400 });

    const db = await getDb();
    const installation = await db.collection("installations").findOne({ id: domain });

    if (!installation) {
        return json({ error: "Not found" }, { status: 404 });
    }

    return json({
        ...installation,
        _id: installation._id.toString(),
    });
}

export async function action({ request, params }: ActionFunctionArgs) {
    const domain = params.domain;
    if (!domain) return json({ error: "Missing domain" }, { status: 400 });

    const db = await getDb();

    if (request.method === "PUT") {
        try {
            const updates = await request.json();

            const result = await db.collection("installations").findOneAndUpdate(
                { id: domain },
                {
                    $set: {
                        ...updates,
                        updatedAt: new Date().toISOString()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!result) return json({ error: "Not found" }, { status: 404 });

            // Audit Log
            await db.collection("audit_logs").insertOne({
                tenantId: domain,
                action: "UPDATE_INSTALLATION",
                entityType: "INSTALLATION",
                entityId: domain,
                details: updates,
                timestamp: new Date().toISOString()
            });

            return json(result);
        } catch (error: any) {
            return json({ error: error.message }, { status: 500 });
        }
    }

    return json({ error: "Method not allowed" }, { status: 405 });
}
