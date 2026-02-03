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
      <Card className="hover:border-primary/50 transition-all duration-200 border-border group bg-white shadow-sm hover:shadow-md rounded-lg overflow-hidden h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-md overflow-hidden border border-border bg-muted flex-shrink-0">
              <Image 
                src={`https://picsum.photos/seed/${agent.id}/80/80`} 
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-headline font-bold text-[#333] group-hover:text-primary transition-colors truncate">
                {agent.name}
              </CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                ID: {agent.id.padStart(4, '0')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-muted" onClick={(e) => e.preventDefault()}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {agent.personality}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#333]">
                <Activity className="h-3 w-3 text-primary" />
                {agent.metrics.usageCount}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#333]">
                <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                {agent.metrics.performanceRating.toFixed(1)}
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 text-[9px] font-black h-4 px-1.5 uppercase">
              ACTIVO
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
