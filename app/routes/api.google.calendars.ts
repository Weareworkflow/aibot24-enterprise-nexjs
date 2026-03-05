import { json, type ActionFunctionArgs } from "@remix-run/node";
import { createSign } from "crypto";

function signJwt(payload: any, privateKey: string) {
    const header = { alg: "RS256", typ: "JWT" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    try {
        const sign = createSign("RSA-SHA256");
        sign.update(signatureInput);
        const signature = sign.sign(privateKey, "base64url");
        return `${signatureInput}.${signature}`;
    } catch (err) {
        console.error("JWT signing error:", err);
        throw new Error("Invalid Private Key format. Please ensure it is a valid RSA private key.");
    }
}

async function getAccessToken(clientEmail: string, privateKey: string) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const payload = {
        iss: clientEmail,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        aud: "https://oauth2.googleapis.com/token",
        exp,
        iat,
    };

    const jwt = signJwt(payload, privateKey);

    const params = new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error_description || error.error || "Failed to get Google access token");
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
        const { clientEmail, privateKey, userEmail } = body;

        if (!clientEmail || !privateKey || !userEmail) {
            return json({ error: "Missing required Google credentials or userEmail" }, { status: 400 });
        }

        const accessToken = await getAccessToken(clientEmail, privateKey);

        // Fetch calendars for the specified user
        // Note: For Workspace delegation, the service account needs to impersonate the user.
        // If not using delegation, it will fetch calendars the service account has access to.
        const response = await fetch(`https://www.googleapis.com/calendar/v3/users/${userEmail}/calendarList`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Failed to fetch Google calendars");
        }

        const data = await response.json();
        const calendars = (data.items || []).map((cal: any) => ({
            id: cal.id,
            name: cal.summary,
            isDefault: cal.primary || false,
        }));

        return json(calendars);
    } catch (error: any) {
        console.error("[Google Calendars POST] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
