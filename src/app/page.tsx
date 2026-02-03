"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { useMemo } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const db = useFirestore();
  
  const agentsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "agents"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: agents, loading: collectionLoading, error } = useCollection<AIAgent>(agentsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {collectionLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Bitrix24...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Conexión</p>
            <p className="text-xs text-muted-foreground max-w-sm">No pudimos obtener la lista de agentes. Verifica la configuración de Firestore.</p>
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
              <div className="col-span-full py-32 text-center space-y-6 flex flex-col items-center">
                <div className="p-4 bg-secondary/5 rounded-full">
                  <Sparkles className="h-8 w-8 text-secondary/40" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-headline font-bold uppercase tracking-widest text-[10px]">No tienes agentes activos en este portal.</p>
                  <Link href="/agents/new">
                    <Button variant="link" className="text-secondary text-xs font-bold p-0 h-auto">
                      Iniciar Protocolo de Creación →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}