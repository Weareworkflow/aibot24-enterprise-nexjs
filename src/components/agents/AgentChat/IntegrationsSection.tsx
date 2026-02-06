
"use client";

import { Switch } from "@/components/ui/switch";
import { AIAgent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MessageSquare, Smartphone, Briefcase, Calendar, LayoutGrid, FileText, UploadCloud, Globe } from "lucide-react";

interface IntegrationsSectionProps {
  agent: AIAgent;
  onUpdate: (field: string, value: any, title?: string) => void;
  onOpenModal: (title: string) => void;
}

const INTEGRATION_LIST = [
  { title: "Open Lines (Chat Bitrix24)", icon: MessageSquare },
  { title: "WhatsApp Business", icon: Smartphone },
  { title: "CRM Bitrix24", icon: Briefcase },
  { title: "Calendario Bitrix24", icon: Calendar },
  { title: "Catálogo Bitrix24", icon: LayoutGrid },
  { title: "Documentos Bitrix24", icon: FileText },
  { title: "Drive Bitrix24", icon: UploadCloud },
  { title: "API REST", icon: Globe },
];

export function IntegrationsSection({ agent, onUpdate, onOpenModal }: IntegrationsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      {INTEGRATION_LIST.map((int) => (
        <div key={int.title} className="flex items-center justify-between p-4 border rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <int.icon className={cn("h-5 w-5", agent.integrations?.[int.title] ? "text-secondary" : "text-muted-foreground")} />
            <span className="text-[12px] font-black uppercase tracking-wider">{int.title}</span>
          </div>
          <Switch 
            checked={agent.integrations?.[int.title] || false} 
            onCheckedChange={(checked) => {
              if (checked) {
                onOpenModal(int.title);
              } else {
                onUpdate('integrations', { ...agent.integrations, [int.title]: false }, int.title);
              }
            }} 
          />
        </div>
      ))}
    </div>
  );
}
