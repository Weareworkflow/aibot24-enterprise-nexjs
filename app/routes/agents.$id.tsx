import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentChat } from "@/components/agents/AgentChat";
import { Loader2 } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { getDb } from "@/lib/mongodb";

export async function loader({ params }: LoaderFunctionArgs) {
    const agentId = params.id;
    if (!agentId) {
        throw new Response("Not Found", { status: 404 });
    }

    const db = await getDb();
    const agent = await db.collection("agents").findOne({ id: agentId });

    if (!agent) {
        throw new Response("Agent Not Found", { status: 404 });
    }

    return json({
        agent: {
            ...agent,
            _id: agent._id.toString(),
        },
    });
}

export default function AgentConsole() {
    const { agent: initialAgent } = useLoaderData<typeof loader>();
    const { id: agentId } = useParams();
    const { agents, setAgent } = useUIStore();
    const [loading, setLoading] = useState(false);

    // Sync state with loader data
    useEffect(() => {
        if (initialAgent) {
            setAgent(initialAgent as any);
        }
    }, [initialAgent, setAgent]);

    // Derive agent from global store
    const agent = agents.find(a => a.id === agentId);

    if (!agent) return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse" />
                    <Loader2 className="h-10 w-10 animate-spin text-secondary relative z-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Sincronizando Protocolos...</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
            <Navbar />
            <main className="flex-1 w-full px-4 md:px-6 py-6 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 mb-4">
                    <div className="h-auto flex flex-col min-h-0">
                        <AgentChat agent={agent as any} />
                    </div>
                </div>
            </main>
        </div>
    );
}
