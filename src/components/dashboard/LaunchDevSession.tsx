"use client";

import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { useToast } from "@/hooks/use-toast";

interface LaunchDevSessionProps {
  memberId: string;
}

export function LaunchDevSession({ memberId }: LaunchDevSessionProps) {
  const { setTenantId } = useUIStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLaunch = () => {
    setTenantId(memberId);
    toast({
      title: "Sesión Vinculada",
      description: `Usando Portal: ${memberId.substring(0, 8)}...`,
    });
    navigate("/");
  };

  return (
    <Button
      onClick={handleLaunch}
      className="pill-rounded bg-secondary hover:bg-secondary/90 text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 gap-2 shadow-lg shadow-secondary/20"
    >
      <LayoutDashboard className="h-4 w-4" />
      Despegar Panel Operativo
    </Button>
  );
}
