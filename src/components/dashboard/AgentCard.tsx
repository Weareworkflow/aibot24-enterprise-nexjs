"use client";

import { AIAgent } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, Trash2, LayoutGrid } from "lucide-react";
import Link from "next/link";

interface AgentCardProps {
  agent: AIAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`} className="block group">
      <Card className="card-rounded hover:border-secondary/40 transition-all duration-300 border-none bg-white pill-shadow overflow-hidden p-8 space-y-8">
        {/* HEADER AREA */}
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <div className="p-1.5 bg-muted rounded flex items-center justify-center">
                <LayoutGrid className="h-3 w-3" />
              </div>
              AIBOT24
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-headline font-black text-primary leading-tight group-hover:text-secondary transition-colors">
                {agent.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full border border-primary/50" />
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {agent.personality}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-10 w-10 pill-rounded border-muted bg-muted/20 hover:bg-primary hover:text-white transition-all">
              <Power className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 pill-rounded border-muted bg-muted/20 hover:bg-destructive hover:text-white transition-all">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { label: "INBOUND", val: agent.metrics.usageCount, color: "text-primary" },
            { label: "TRANSF", val: agent.metrics.totalInteractionMetric, color: "text-secondary" },
            { label: "ABAND", val: agent.feedback?.[0] || "0", color: "text-destructive" },
          ].map((m, i) => (
            <div key={i} className="text-center space-y-2 p-4 bg-muted/30 pill-rounded border border-white">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{m.label}</p>
              <p className={cn("text-lg font-headline font-black", m.color)}>{m.val}</p>
            </div>
          ))}
        </div>
      </Card>
    </Link>
  );
}

// Helper function for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}