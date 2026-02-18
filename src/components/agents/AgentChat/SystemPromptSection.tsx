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
        onUpdate({ systemPrompt: prompt }, "Prompt del Sistema");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                    Instrucciones del Sistema
                </p>
                <p className="text-sm text-muted-foreground">
                    Define el comportamiento base, la personalidad y las reglas que debe seguir el agente.
                </p>
            </div>

            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Eres un asistente experto en..."
                className="min-h-[300px] font-mono text-sm bg-muted/30 border-border/50 focus-visible:ring-1 resize-y p-4 rounded-xl leading-relaxed"
            />

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={prompt === agent.systemPrompt}
                    className="gap-2 bg-secondary text-white hover:bg-secondary/90"
                >
                    <Save className="h-4 w-4" />
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
