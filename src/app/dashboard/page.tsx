"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { VoiceAgent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter, TrendingUp, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const INITIAL_AGENTS: VoiceAgent[] = [
  {
    id: "1",
    name: "Aria Tech-Support",
    personality: "A patient, knowledgeable, and tech-savvy assistant designed to help customers solve complex software issues.",
    responseStyle: "Concise, instructional, and calm.",
    initialContext: "Expert in SaaS platforms, common troubleshooting steps, and empathetic communication.",
    createdAt: "2024-01-15T10:00:00Z",
    metrics: {
      usageCount: 1240,
      performanceRating: 4.8,
      totalChatTime: 5200
    }
  },
  {
    id: "2",
    name: "Marcus Sales-Pro",
    personality: "Energetic, persuasive, and highly professional sales representative specializing in high-ticket closing.",
    responseStyle: "Warm, engaging, and focused on value propositions.",
    initialContext: "Extensive knowledge of product features, handling objections, and closing techniques.",
    createdAt: "2024-02-01T14:30:00Z",
    metrics: {
      usageCount: 850,
      performanceRating: 4.5,
      totalChatTime: 3100
    }
  },
  {
    id: "3",
    name: "Zen Meditation Guide",
    personality: "Soothing, mindful, and deeply empathetic coach for mental wellness apps.",
    responseStyle: "Soft-spoken, slow-paced, and filled with pauses.",
    initialContext: "Knowledge of breathing exercises, mindfulness techniques, and mental health best practices.",
    createdAt: "2024-02-10T09:15:00Z",
    metrics: {
      usageCount: 2100,
      performanceRating: 4.9,
      totalChatTime: 12400
    }
  }
];

export default function DashboardPage() {
  const [agents, setAgents] = useState<VoiceAgent[]>(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-foreground">Agent Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your fleet of intelligent voice agents.</p>
          </div>
          <Button asChild className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <Link href="/agents/new">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Agent
            </Link>
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-headline font-bold">12</div>
              <p className="text-xs text-green-600 font-medium">+2 this month</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-headline font-bold">4,190</div>
              <p className="text-xs text-green-600 font-medium">+14% vs last week</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Avg Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-headline font-bold">2.4m</div>
              <p className="text-xs text-blue-600 font-medium">-12s improvement</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Satisfaction Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-headline font-bold">4.82/5</div>
              <p className="text-xs text-green-600 font-medium">Top 5% industry</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search agents by name..." 
              className="pl-10 h-11 bg-white border-border/50 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11 px-4 rounded-xl border-border/50 bg-white">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          {filteredAgents.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-headline font-semibold">No agents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or create a new agent.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/agents/new">Create First Agent</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}