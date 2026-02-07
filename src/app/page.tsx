
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AgentList } from "@/components/dashboard/AgentList";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { useMemo, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUIStore } from "@/lib/store";

export default function HomePage() {
  const db = useFirestore();
  const { tenantId } = useUIStore();
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const memberId = params.get('member_id');
    if (memberId && !tenantId) {
      useUIStore.getState().setTenantId(memberId);
    }
  }, [tenantId]);

  const agentsQuery = useMemo(() => {
    if (!db || !tenantId) return null;
    return query(
      collection(db, "agents"), 
      where("tenantId", "==", tenantId)
    );
  }, [db, tenantId]);

  const { data: agents, loading, error } = useCollection<AIAgent>(agentsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {!tenantId && (
          <div className="max-w-6xl mx-auto mb-6 bg-secondary/5 border border-secondary/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <Info className="h-6 w-6 text-secondary flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">No se ha detectado el portal de Bitrix24</p>
                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest mt-1">Es necesario ejecutar el protocolo de enlace inicial</p>
              </div>
            </div>
            <Link href="/install">
              <Button variant="default" className="pill-rounded bg-secondary text-white text-[10px] font-black uppercase tracking-widest px-6 h-10">
                Enlazar Portal →
              </Button>
            </Link>
          </div>
        )}

        <AgentList 
          agents={agents} 
          loading={loading} 
          error={error} 
          tenantId={tenantId} 
        />
      </main>
    </div>
  );
}
