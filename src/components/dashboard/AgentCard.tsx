"use client";

import { VoiceAgent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Star, MoreVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AgentCardProps {
  agent: VoiceAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`} className="block group">
      <Card className="hover:border-primary/40 transition-all duration-200 border-border group bg-white shadow-sm hover:shadow-md rounded-lg overflow-hidden h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative h-9 w-9 rounded overflow-hidden border border-border/60 bg-muted flex-shrink-0 group-hover:border-primary/20 transition-colors">
              <Image 
                src={`https://picsum.photos/seed/${agent.id}/80/80`} 
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xs font-headline font-bold text-[#333] group-hover:text-primary transition-colors truncate">
                {agent.name}
              </CardTitle>
              <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tight leading-none mt-0.5">
                ID: {agent.id.padStart(4, '0')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <MoreVertical className="h-3 w-3" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-3 pt-1 flex-1 flex flex-col justify-between">
          <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-snug">
            {agent.personality}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#444]">
                <Activity className="h-3 w-3 text-primary" />
                {agent.metrics.usageCount}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#444]">
                <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                {agent.metrics.performanceRating.toFixed(1)}
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100/50 text-[8px] font-black h-3.5 px-1 uppercase tracking-tighter">
              OK
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
