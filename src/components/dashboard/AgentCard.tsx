"use client";

import { VoiceAgent } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, MessageSquare, Star, ArrowRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AgentCardProps {
  agent: VoiceAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-border group bg-white overflow-hidden rounded-xl">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-2">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border shadow-sm">
            <Image 
              src={`https://picsum.photos/seed/${agent.id}/100/100`} 
              alt={agent.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="text-base font-headline font-bold text-[#333] group-hover:text-primary transition-colors">
              {agent.name}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
              {new Date(agent.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-5 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-4">
          {agent.personality}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-[#333]">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold">{agent.metrics.usageCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#333]">
            <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
            <span className="font-bold">{agent.metrics.performanceRating.toFixed(1)}</span>
          </div>
          <Badge variant="outline" className="ml-auto bg-green-50 text-green-600 border-green-200 text-[10px] font-bold py-0 h-5">
            ONLINE
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-0 border-t">
        <Button asChild className="w-full h-11 rounded-none bg-transparent hover:bg-primary/5 text-primary border-none shadow-none font-semibold text-xs" variant="ghost">
          <Link href={`/agents/${agent.id}`} className="flex items-center justify-center gap-2">
            GESTIONAR AGENTE
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}