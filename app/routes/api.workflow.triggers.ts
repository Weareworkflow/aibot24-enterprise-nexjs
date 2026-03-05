import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { TriggersService } from "@/lib/triggers-service";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const url = new URL(request.url);
        const tenantId = url.searchParams.get("tenantId");

        if (!tenantId) {
            return json({ error: "Missing tenantId" }, { status: 400 });
        }

        const triggers = await TriggersService.listByTenant(tenantId);
        return json(triggers);
    } catch (error: any) {
        console.error("[Workflow Triggers GET] Error:", error);
        return json({ error: error.message || "Internal error" }, { status: 500 });
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const db = await TriggersService; // Just to ensure dependency is considered, though we use static methods

    if (request.method === "POST") {
        try {
            const body = await request.json();
            const id = await TriggersService.create(body);
            return json({ id, success: true });
        } catch (error: any) {
            console.error("[Workflow Triggers POST] Error:", error);
            return json({ error: error.message || "Internal error" }, { status: 500 });
        }
    }

    if (request.method === "PUT") {
        try {
            const url = new URL(request.url);
            const id = url.searchParams.get("id");
            if (!id) return json({ error: "Missing id" }, { status: 400 });

            const body = await request.json();
            const success = await TriggersService.update(id, body);
            return json({ success });
        } catch (error: any) {
            console.error("[Workflow Triggers PUT] Error:", error);
            return json({ error: error.message || "Internal error" }, { status: 500 });
        }
    }

    if (request.method === "DELETE") {
        try {
            const url = new URL(request.url);
            const id = url.searchParams.get("id");
            if (!id) return json({ error: "Missing id" }, { status: 400 });

            const success = await TriggersService.delete(id);
            return json({ success });
        } catch (error: any) {
            console.error("[Workflow Triggers DELETE] Error:", error);
            return json({ error: error.message || "Internal error" }, { status: 500 });
        }
    }

    return json({ error: "Method not allowed" }, { status: 405 });
}
