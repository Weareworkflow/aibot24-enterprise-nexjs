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
    const [promptRegistered, setPromptRegistered] = useState(agent.systemPromptRegistered || "");
    const { toast } = useToast();

    useEffect(() => {
        setPrompt(agent.systemPrompt || "");
        setPromptRegistered(agent.systemPromptRegistered || "");
    }, [agent.systemPrompt, agent.systemPromptRegistered]);

    const handleSave = () => {
        onUpdate({
            systemPrompt: prompt,
            systemPromptRegistered: promptRegistered
        }, "Prompts del Sistema");
    };

    const hasChanges = prompt !== agent.systemPrompt || promptRegistered !== agent.systemPromptRegistered;

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                    Instrucciones del Sistema
                </p>
                <p className="text-sm text-muted-foreground">
                    Divide el comportamiento del agente según el estado del usuario.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PROMPT BASE / NUEVOS */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            Base (Nuevos / Registrando)
                        </span>
                    </div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Eres un asistente que capta datos..."
                        className="min-h-[400px] font-mono text-xs bg-muted/20 border-border/40 focus-visible:ring-secondary/50 p-5 rounded-2xl leading-relaxed resize-none"
                    />
                </div>

                {/* PROMPT SEGUIMIENTO / REGISTRADOS */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            Seguimiento (Registrados / Con Cita)
                        </span>
                    </div>
                    <Textarea
                        value={promptRegistered}
                        onChange={(e) => setPromptRegistered(e.target.value)}
                        placeholder="Eres el asesor asignado que ya conoce al cliente..."
                        className="min-h-[400px] font-mono text-xs bg-muted/20 border-border/40 focus-visible:ring-primary/50 p-5 rounded-2xl leading-relaxed resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="gap-2 bg-secondary text-white hover:bg-secondary/90 px-8 h-12 rounded-2xl shadow-xl shadow-secondary/20 transition-all font-bold uppercase text-[10px] tracking-widest"
                >
                    <Save className="h-4 w-4" />
                    Guardar Configuración Dual
                </Button>
            </div>
        </div>
    );
}
