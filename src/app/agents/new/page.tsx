"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Save, Mic2, Wand2 } from "lucide-react";
import { generateAgentConfig, type GenerateAgentConfigOutput } from "@/ai/flows/generate-agent-config";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function NewAgentPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<GenerateAgentConfigOutput | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please describe what kind of agent you want to create.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAgentConfig({ prompt });
      setConfig(result);
      toast({
        title: "Configuration Generated",
        description: "Agent details have been automatically populated based on your prompt.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the agent configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Agent Created",
        description: `${config.agentName} is now ready for deployment.`,
      });
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 max-w-4xl">
        <div className="mb-8 space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
            <Mic2 className="h-8 w-8 text-primary" />
            Create Your Voice Agent
          </h1>
          <p className="text-muted-foreground">Design a personalized AI voice assistant using our intelligent configuration tool.</p>
        </div>

        <div className="grid gap-8">
          {/* AI Config Tool */}
          <Card className="border-primary/20 bg-primary/[0.02] shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Wand2 className="h-5 w-5" />
                Intelligent Configuration Tool
              </CardTitle>
              <CardDescription>
                Describe the agent's purpose, and we'll infer its personality, response style, and context.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Agent Concept</Label>
                <Textarea 
                  id="prompt"
                  placeholder="e.g., A helpful real estate assistant that's professional yet warm, focused on helping first-time home buyers in New York..."
                  className="min-h-[120px] rounded-xl border-border/50 bg-white"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full h-11 rounded-xl shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Requirements...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Auto-Configure Agent
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Form Detail Section */}
          <Card className={config ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "opacity-50 pointer-events-none"}>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
              <CardDescription>Finalize your agent's identity and behavior settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input 
                    id="name" 
                    value={config?.agentName || ""} 
                    onChange={(e) => config && setConfig({ ...config, agentName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personality">Personality Persona</Label>
                  <Input 
                    id="personality" 
                    value={config?.agentPersonality || ""} 
                    onChange={(e) => config && setConfig({ ...config, agentPersonality: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Response Style</Label>
                <Textarea 
                  id="style" 
                  value={config?.agentResponseStyle || ""} 
                  onChange={(e) => config && setConfig({ ...config, agentResponseStyle: e.target.value })}
                  className="min-h-[80px] rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Knowledge Base & Context</Label>
                <Textarea 
                  id="context" 
                  value={config?.agentInitialContext || ""} 
                  onChange={(e) => config && setConfig({ ...config, agentInitialContext: e.target.value })}
                  className="min-h-[120px] rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 bg-muted/10">
              <div className="flex w-full gap-4 justify-end">
                <Button variant="outline" className="rounded-xl" onClick={() => router.push("/dashboard")}>Cancel</Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving || !config} 
                  className="rounded-xl px-8 bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Agent...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Deploy Agent
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}