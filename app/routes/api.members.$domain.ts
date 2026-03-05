import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";
import { AIBotMember } from "@/lib/types";

export async function loader({ params }: LoaderFunctionArgs) {
    try {
        const domain = params.domain;
        if (!domain) return json({ error: "Missing domain" }, { status: 400 });

        const db = await getDb();
        const members = await db.collection("members")
            .find({ domain })
            .toArray();

        return json(members.map(m => ({ ...m, _id: undefined })));
    } catch (error: any) {
        console.error("[Members loader] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}

export async function action({ request, params }: ActionFunctionArgs) {
    const domain = params.domain;
    if (!domain) return json({ error: "Missing domain" }, { status: 400 });

    const db = await getDb();

    if (request.method === "POST") {
        try {
            const body = await request.json();
            const { userId, userName, role } = body;

            if (!userId) {
                return json({ error: "Missing userId" }, { status: 400 });
            }

            const memberIdKey = `${domain}-${userId}`;

            const member: Partial<AIBotMember> = {
                id: memberIdKey,
                userId,
                userName: userName || `User ${userId}`,
                domain,
                role: role || "viewer",
                addedAt: new Date().toISOString(),
                lastVisit: new Date().toISOString()
            };

            await db.collection("members").updateOne(
                { id: memberIdKey },
                { $set: member },
                { upsert: true }
            );

            return json({ success: true });
        } catch (error: any) {
            console.error("[Members POST] Error:", error);
            return json({ error: error.message || "Internal error" }, { status: 500 });
        }
    }

    if (request.method === "DELETE") {
        try {
            const url = new URL(request.url);
            const userId = url.searchParams.get("userId");

            if (!userId) {
                return json({ error: "Missing userId" }, { status: 400 });
            }

            const memberIdKey = `${domain}-${userId}`;

            await db.collection("members").deleteOne({ id: memberIdKey });

            return json({ success: true });
        } catch (error: any) {
            console.error("[Members DELETE] Error:", error);
            return json({ error: error.message || "Internal error" }, { status: 500 });
        }
    }

    return json({ error: "Method not allowed" }, { status: 405 });
}
