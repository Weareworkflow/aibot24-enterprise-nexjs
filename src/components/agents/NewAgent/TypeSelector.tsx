
"use client";

import { AgentType } from "@/lib/types";
import { Phone, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TypeSelectorProps {
  onSelect: (type: AgentType) => void;
}

export function TypeSelector({ onSelect }: TypeSelectorProps) {
  return (
    <Card className="border-none shadow-sm animate-in fade-in zoom-in-95 duration-500 card-rounded p-8">
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-lg font-bold">Bienvenido, Operador</h2>
        <p className="text-xs text-muted-foreground">Selecciona el canal de comunicación principal para tu nueva IA.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onSelect('voice')}
          className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-dashed border-muted hover:border-secondary hover:bg-secondary/5 transition-all group"
        >
          <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all">
            <Phone className="h-10 w-10 text-secondary group-hover:text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-black text-sm uppercase tracking-wider">Modo Live</h3>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">Llamadas y Telefonía</p>
          </div>
        </button>
        <button 
          onClick={() => onSelect('text')}
          className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-2 border-dashed border-muted hover:border-accent hover:bg-accent/5 transition-all group"
        >
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
            <MessageSquareText className="h-10 w-10 text-accent group-hover:text-white" />
          </div>
          <div className="text-center">
            <h3 className="font-black text-sm uppercase tracking-wider">Modo Chat</h3>
            <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase">Mensajería y WhatsApp</p>
          </div>
        </button>
      </div>
    </Card>
  );
}
