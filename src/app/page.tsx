
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { useMemo } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const db = useFirestore();
  
  const agentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "agents"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: agents, loading } = useCollection<AIAgent>(agentsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Bitrix24...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {agents?.map(agent => (
              <AgentCard 
                key={agent.id} 
                agent={agent} 
              />
            ))}
            {(!agents || agents.length === 0) && (
              <div className="col-span-full py-20 text-center space-y-4">
                <p className="text-muted-foreground font-headline font-bold uppercase tracking-widest text-[10px]">No tienes agentes activos en este portal.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
