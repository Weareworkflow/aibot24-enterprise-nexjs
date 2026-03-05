import { json, type ActionFunctionArgs } from "@remix-run/node";

async function getAccessToken(tenantId: string, clientId: string, clientSecret: string) {
    const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
    });

    const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || "Failed to get Microsoft Graph access token");
    }

    const data = await response.json();
    return data.access_token;
}

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        const { tenantId, clientId, clientSecret, userEmail } = body;

        if (!tenantId || !clientId || !clientSecret || !userEmail) {
            return json({ error: "Missing required Outlook credentials or userEmail" }, { status: 400 });
        }

        const accessToken = await getAccessToken(tenantId, clientId, clientSecret);

        const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/calendars`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Failed to fetch Outlook calendars");
        }

        const data = await response.json();
        const calendars = (data.value || []).map((cal: any) => ({
            id: cal.id,
            name: cal.name,
            isDefault: cal.isDefaultCalendar,
        }));

        return json(calendars);
    } catch (error: any) {
        console.error("[Outlook Calendars POST] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
