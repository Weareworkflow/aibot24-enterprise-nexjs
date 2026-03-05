import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { callBitrixMethod } from "@/lib/bitrix-service";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const url = new URL(request.url);
        const tenantId = url.searchParams.get("tenantId");
        const search = url.searchParams.get("search");

        if (!tenantId) {
            return json({ error: "Missing tenantId" }, { status: 400 });
        }

        const params: any = {
            ACTIVE: "Y",
        };

        if (search) {
            params.FIND = search;
        }

        const result = await callBitrixMethod(tenantId, "user.get", params);

        if (result.error) {
            return json({ error: result.error_description || result.error }, { status: 500 });
        }

        // Map to a simpler format for the frontend
        const users = (result.result || []).map((user: any) => ({
            id: user.ID,
            name: `${user.NAME} ${user.LAST_NAME}`.trim(),
            email: user.EMAIL,
            workPosition: user.WORK_POSITION,
            avatar: user.PERSONAL_PHOTO,
        }));

        return json(users);

    } catch (error: any) {
        console.error("[Bitrix Users loader] Error:", error);
        return json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
