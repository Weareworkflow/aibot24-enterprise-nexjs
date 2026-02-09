"use client";

import { useMemo, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { Loader2, Sparkles, LayoutDashboard, SearchX, Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUIStore } from "@/lib/store";
import { translations } from "@/lib/translations";

export default function DashboardPage() {
  const db = useFirestore();
  const { searchQuery, tenantId, setAgents, agents: globalAgents, language } = useUIStore();
  const t = translations[language].dashboard;
  
  const agentsQuery = useMemo(() => {
    if (!db) return null;
    const effectiveTenantId = tenantId || "anonymous";
    return query(
      collection(db, "agents"), 
      where("tenantId", "==", effectiveTenantId)
    );
  }, [db, tenantId]);

  const { data: firestoreAgents, loading: collectionLoading, error } = useCollection<AIAgent>(agentsQuery);

  useEffect(() => {
    if (firestoreAgents) {
      setAgents(firestoreAgents);
    }
  }, [firestoreAgents, setAgents]);

  const filteredAgents = useMemo(() => {
    if (!globalAgents) return [];

    const sorted = [...globalAgents].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const q = searchQuery.toLowerCase().trim();
    if (!q) return sorted;

    return sorted.filter(agent => (
      agent.name.toLowerCase().includes(q) ||
      agent.role.toLowerCase().includes(q) ||
      agent.company.toLowerCase().includes(q)
    ));
  }, [globalAgents, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="w-full px-4 md:px-8 py-8 space-y-8">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-xl">
              <LayoutDashboard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold text-foreground">{t.title}</h1>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                {tenantId ? `Portal: ${tenantId}` : "Sesión Anónima"}
              </p>
            </div>
          </div>
        </div>

        {collectionLoading && globalAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">{t.syncing}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-destructive/5 rounded-full">
              <Database className="h-8 w-8 text-destructive/40" />
            </div>
            <p className="text-destructive font-black uppercase tracking-widest text-[10px]">{t.error_sync}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full">
            {filteredAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}

            {globalAgents.length > 0 && filteredAgents.length === 0 && (
              <div className="col-span-full py-32 text-center space-y-4 flex flex-col items-center border-2 border-dashed border-border rounded-[3rem] bg-card/50">
                <SearchX className="h-10 w-10 text-muted-foreground/30" />
                <Button variant="link" onClick={() => useUIStore.getState().setSearchQuery('')} className="text-secondary text-[10px] font-black uppercase">
                  {t.clear_search}
                </Button>
              </div>
            )}

            {globalAgents.length === 0 && !collectionLoading && (
              <div className="col-span-full py-24 text-center space-y-8 flex flex-col items-center border-2 border-dashed border-border rounded-[3rem] bg-card shadow-sm w-full max-w-4xl mx-auto">
                <div className="h-20 w-20 rounded-full bg-secondary/5 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-secondary/30" />
                </div>
                <h2 className="text-xl font-headline font-bold text-foreground">{t.no_fleet}</h2>
                <Link href="/agents/new">
                  <Button className="pill-rounded bg-secondary text-white font-black text-[10px] uppercase px-8 h-12 gap-2">
                    <Plus className="h-4 w-4" /> {t.setup_first}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
