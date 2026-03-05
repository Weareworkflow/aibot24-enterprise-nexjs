import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect, useState, Suspense } from "react";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useUIStore } from "@/lib/store";
import { AIAgent } from "@/lib/types";
import {
    Search,
    Plus,
    Zap,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/mongodb";

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get("tenantId") || url.searchParams.get("DOMAIN");

    if (!tenantId) {
        return json({ agents: [], tenantId: null });
    }

    const db = await getDb();
    const agents = await db.collection("agents").find({ tenantId }).toArray();

    // Minimal serialization to avoid hydration issues with MongoDB IDs
    const serializedAgents = agents.map(agent => ({
        ...agent,
        _id: agent._id.toString(),
    }));

    return json({ agents: serializedAgents, tenantId });
}

export default function DashboardIndex() {
    const { agents: initialAgents, tenantId: loaderTenantId } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const {
        searchQuery, setSearchQuery,
        tenantId, setTenantId,
        setAgents,
        agents,
        userRole
    } = useUIStore();

    const [loading, setLoading] = useState(false);

    // Sync state with loader data
    useEffect(() => {
        if (loaderTenantId) {
            setTenantId(loaderTenantId);
            setAgents(initialAgents as any);
        }
    }, [initialAgents, loaderTenantId, setTenantId, setAgents]);

    const filteredAgents = agents?.filter((a: AIAgent) =>
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.company?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (!tenantId && !loaderTenantId) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                    <h2 className="text-xl font-headline font-bold text-foreground">Portal No Identificado</h2>
                    <p className="text-sm text-muted-foreground">Accede desde tu portal Bitrix24.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="sticky top-0 z-40 -mx-4 px-4 py-4 mb-4 bg-background/95 backdrop-blur-sm border-b border-border/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar agente..."
                            className="pl-12 h-12 bg-card border-border/60 rounded-2xl text-sm font-medium focus-visible:ring-secondary/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {userRole !== 'viewer' && (
                        <Button
                            onClick={() => navigate('/agents/new')}
                            className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Agente
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6 px-1">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-foreground text-background rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                    <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    {filteredAgents.length} Unidad{filteredAgents.length !== 1 ? 'es' : ''}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            ) : filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map((agent: AIAgent) => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-[11px] font-black uppercase text-muted-foreground tracking-widest">Sin resultados</p>
                        <p className="text-xs text-muted-foreground">Crea tu primer agente para comenzar.</p>
                    </div>
                </div>
            )}
        </main>
    );
}
