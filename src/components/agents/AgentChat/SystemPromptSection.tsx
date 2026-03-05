"use client";

import { AIAgent } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemPromptSectionProps {
    agent: AIAgent;
    onUpdate: (updates: Partial<AIAgent>, title?: string) => void;
}

export function SystemPromptSection({ agent, onUpdate }: SystemPromptSectionProps) {
    const [prompt, setPrompt] = useState(agent.systemPrompt || "");
    const { toast } = useToast();

    useEffect(() => {
        setPrompt(agent.systemPrompt || "");
    }, [agent.systemPrompt]);

    const handleSave = () => {
        onUpdate({
            systemPrompt: prompt,
        }, "Instrucciones del Sistema");
    };

    const hasChanges = prompt !== agent.systemPrompt;

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                    Instrucciones del Sistema
                </p>
                <p className="text-sm text-muted-foreground">
                    Define el comportamiento y personalidad principal del agente.
                </p>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                        Prompt Maestro
                    </span>
                </div>
                <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Escribe las instrucciones aquí..."
                    className="min-h-[500px] font-mono text-xs bg-muted/20 border-border/40 focus-visible:ring-secondary/50 p-6 rounded-3xl leading-relaxed resize-none shadow-inner"
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="gap-2 bg-secondary text-white hover:bg-secondary/90 px-8 h-12 rounded-2xl shadow-xl shadow-secondary/20 transition-all font-bold uppercase text-[10px] tracking-widest"
                >
                    <Save className="h-4 w-4" />
                    Guardar Instrucciones
                </Button>
            </div>
        </div>
    );
}
