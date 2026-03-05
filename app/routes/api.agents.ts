import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId") || url.searchParams.get("DOMAIN");

    if (!tenantId) {
        return json({ error: "Missing tenantId" }, { status: 400 });
    }

    const db = await getDb();
    const agents = await db.collection("agents").find({ tenantId }).toArray();

    return json(agents.map(agent => ({
        ...agent,
        _id: agent._id.toString(),
    })));
}
