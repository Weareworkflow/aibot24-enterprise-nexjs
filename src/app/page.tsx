"use client";

import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { AIAgent } from "@/lib/types";
import { useMemo } from "react";
import { Loader2, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const agentsQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "agents"), orderBy("createdAt", "desc"));
  }, [db, user]);

  const { data: agents, loading: collectionLoading, error } = useCollection<AIAgent>(agentsQuery);

  const isLoading = userLoading || (user && collectionLoading);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FB]">
      <Navbar />
      <main className="container mx-auto px-4 py-8 space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizando con Bitrix24...</p>
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-32 text-center max-w-md mx-auto space-y-6">
            <div className="h-16 w-16 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-headline font-bold uppercase tracking-tight">Acceso Restringido</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Debes iniciar sesión con tu cuenta corporativa para gestionar las unidades de IA del portal <strong>aibot24-voice</strong>.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-destructive font-black uppercase tracking-widest text-[10px]">Error de Conexión</p>
            <p className="text-xs text-muted-foreground max-w-sm">No pudimos obtener la lista de agentes. Verifica tus permisos en Firestore.</p>
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