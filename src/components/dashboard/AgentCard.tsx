"use client";

import { VoiceAgent } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, MessageSquare, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface AgentCardProps {
  agent: VoiceAgent;
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 group">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/10">
          <Image 
            src={`https://picsum.photos/seed/${agent.id}/100/100`} 
            alt={agent.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg font-headline line-clamp-1">{agent.name}</CardTitle>
          <p className="text-xs text-muted-foreground">Created {new Date(agent.createdAt).toLocaleDateString()}</p>
        </div>
        <Badge variant="secondary" className="bg-secondary/10 text-secondary border-none">
          Active
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {agent.personality}
        </p>
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50">
          <div className="flex flex-col items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold">{agent.metrics.usageCount}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Calls</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-secondary" />
            <span className="text-xs font-semibold">{agent.metrics.totalChatTime}m</span>
            <span className="text-[10px] text-muted-foreground uppercase">Chat</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="h-3.5 w-3.5 text-orange-400" />
            <span className="text-xs font-semibold">{agent.metrics.performanceRating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground uppercase">Score</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full group-hover:bg-primary transition-colors" variant="outline">
          <Link href={`/agents/${agent.id}`} className="flex items-center justify-center gap-2">
            View Console
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}