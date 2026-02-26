"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { useUIStore } from "@/lib/store";
import { AIAgent } from "@/lib/types";
import {
  Search,
  Plus,
  Zap,
  AlertCircle,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    searchQuery, setSearchQuery,
    tenantId, setTenantId,
    memberId, setMemberId,
    domain, setDomain,
    agents, setAgents,
    loadAppConfig,
    language,
    userId, setUserId,
    userRole, setUserRole,
    isAuthorized, setIsAuthorized,
    setAgentMetrics
  } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Context initialization from URL params (Bitrix24 iframe)
  useEffect(() => {
    const BX24 = (window as any).BX24;
    const urlDomain = searchParams.get('DOMAIN');
    const urlUser = searchParams.get('USER_ID');
    const urlMemberId = searchParams.get('member_id');

    if (BX24) {
      BX24.init(() => {
        const auth = BX24.getAuth();
        if (auth) {
          const d = auth.domain || urlDomain;
          const m = auth.member_id || urlMemberId;
          const u = auth.user_id || urlUser;

          if (d) {
            if (tenantId !== d) setAgents([]); // Clear agents before switching
            setTenantId(d);
            setDomain(d);
          }
          if (m) setMemberId(m);
          if (u) setUserId(u);
        }
      });
    } else {
      // Fallback for local dev or direct access
      if (urlDomain) {
        if (tenantId !== urlDomain) setAgents([]); // Clear agents before switching
        setTenantId(urlDomain);
        setDomain(urlDomain);
      }
      if (urlUser) setUserId(urlUser);
      if (urlMemberId) setMemberId(urlMemberId);
    }
  }, [searchParams, tenantId, setTenantId, setDomain, setAgents, setMemberId, setUserId]);

  // Authorization Check - DISABLED members logic (Everyone is admin for now)
  useEffect(() => {
    if (tenantId && userId) {
      setIsAuthorized(true);
      setUserRole('admin');
    }

    /* 
    const checkAuth = async () => {
      if (!tenantId || !userId) return;

      try {
        const res = await fetch(`/api/members/${encodeURIComponent(tenantId)}`);
        if (res.ok) {
          const members = await res.json();
          const member = members.find((m: any) => m.userId === userId);

          if (member) {
            setIsAuthorized(true);
            setUserRole(member.role);
          } else {
            // Default to viewer for anyone else in the portal
            setIsAuthorized(true);
            setUserRole('viewer');
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    };

    checkAuth();
    */
  }, [tenantId, userId]);

  // Fetch agents from API
  const fetchAgents = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents?tenantId=${encodeURIComponent(tenantId)}`);
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      setAgents(data);
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tenantId, setAgents]);

  useEffect(() => {
    if (tenantId) {
      fetchAgents();
      loadAppConfig(tenantId);

      // --- Real-time Metrics SSE Connection ---
      const eventSource = new EventSource(`/api/metrics/events?tenantId=${encodeURIComponent(tenantId)}`);

      eventSource.onmessage = (event) => {
        try {
          const updatedMetricsArray = JSON.parse(event.data);
          if (Array.isArray(updatedMetricsArray)) {
            updatedMetricsArray.forEach(m => {
              setAgentMetrics(m.agentId, m);
            });
          }
        } catch (err) {
          console.error("SSE Parse Error:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Connection Error:", err);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  }, [tenantId, fetchAgents, loadAppConfig, setAgentMetrics]);

  const filteredAgents = agents?.filter((a: AIAgent) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (!tenantId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
          <h2 className="text-xl font-headline font-bold text-foreground">Portal No Identificado</h2>
          <p className="text-sm text-muted-foreground">Accede desde tu portal Bitrix24 o configura el modo de desarrollo local.</p>
        </div>
      </div>
    );
  }


  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Top Bar Container - Sticky */}
      <div className="sticky top-14 z-40 -mx-4 px-4 py-4 mb-4 bg-background/95 backdrop-blur-sm border-b border-border/5">
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
              onClick={() => router.push('/agents/new')}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-secondary text-white shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest"
            >
              <Plus className="h-4 w-4" />
              Nuevo Agente
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
