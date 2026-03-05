import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ params }: LoaderFunctionArgs) {
    const tenantId = params.tenantId;
    if (!tenantId) return json({ error: "Missing tenantId" }, { status: 400 });

    const db = await getDb();
    const config = await db.collection("config-app").findOne({ id: tenantId });

    if (!config) {
        return json({ error: "Not found" }, { status: 404 });
    }

    return json({
        ...config,
        _id: config._id.toString(),
    });
}

export async function action({ request, params }: ActionFunctionArgs) {
    const tenantId = params.tenantId;
    const db = await getDb();

    if (request.method === "PUT") {
        try {
            const updates = await request.json();
            const result = await db.collection("config-app").findOneAndUpdate(
                { id: tenantId },
                {
                    $set: {
                        ...updates,
                        updatedAt: new Date().toISOString()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!result) return json({ error: "Not found" }, { status: 404 });

            return json(result);
        } catch (error: any) {
            return json({ error: error.message }, { status: 500 });
        }
    }

    return json({ error: "Method not allowed" }, { status: 405 });
}
