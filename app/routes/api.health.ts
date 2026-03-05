import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getDb } from "@/lib/mongodb";

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        // Ping database to ensure connectivity
        const db = await getDb();
        await db.command({ ping: 1 });

        return json({
            status: "ok",
            timestamp: new Date().toISOString(),
            service: "aibot24-dashboard",
            database: "connected"
        }, { status: 200 });
    } catch (error: any) {
        console.error("[Health Check Error]:", error);
        return json({
            status: "error",
            message: error.message || "Internal server error"
        }, { status: 503 });
    }
}
