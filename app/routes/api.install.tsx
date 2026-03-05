import { redirect, type ActionFunctionArgs, json } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const contentType = request.headers.get("content-type") || "";
        let body: any = {};

        if (contentType.includes("application/json")) {
            body = await request.json();
        } else {
            const formData = await request.formData();
            body = Object.fromEntries(formData.entries());
        }

        // Normalize Bitrix24 properties if they are at the root
        if (body.AUTH_ID && !body.auth) {
            body.auth = {
                access_token: body.AUTH_ID,
                refresh_token: body.REFRESH_ID,
                domain: body.DOMAIN,
                member_id: body.MEMBER_ID,
                expires_in: body.AUTH_EXPIRES,
            };
        }

        const { auth } = body;

        if (!auth || !auth.member_id) {
            console.error("[API Install] Missing auth data. Body:", body);
            return json({ error: "Missing authentication data" }, { status: 400 });
        }

        const domain = auth.domain;
        const memberId = auth.member_id;
        const db = await getDb();

        // Persist installation
        await db.collection("installations").updateOne(
            { id: domain },
            {
                $set: {
                    memberId: memberId,
                    domain: domain,
                    status: "active",
                    accessToken: auth.access_token,
                    refreshToken: auth.refresh_token,
                    expiresIn: parseInt(auth.expires_in || "3600"),
                    updatedAt: new Date().toISOString(),
                },
                $setOnInsert: {
                    createdAt: new Date().toISOString(),
                }
            },
            { upsert: true }
        );

        // Initial config if not exists
        await db.collection("config-app").updateOne(
            { id: domain },
            {
                $setOnInsert: {
                    id: domain,
                    theme: "light",
                    language: "es",
                    tenantId: domain,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }
            },
            { upsert: true }
        );

        // Redirect to dashboard
        const url = new URL(request.url);
        const redirectUrl = `${url.origin}/?DOMAIN=${encodeURIComponent(domain)}&member_id=${encodeURIComponent(memberId)}`;

        return redirect(redirectUrl);

    } catch (error: any) {
        console.error("[API Install] Error:", error);
        return json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
