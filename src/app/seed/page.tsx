"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCollections, getSubCollections } from "@/lib/db-schema";
import { useFirestore } from "@/firebase";
import { setDoc, doc, Timestamp, collection, addDoc } from "firebase/firestore";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SeedPage() {
    const db = useFirestore();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string[]>([]);

    // Security Check: Only allow in 'test' environment or dev mode
    const isAllowed = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'test';

    if (!isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-6 text-center border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h1 className="text-xl font-bold text-destructive">Access Denied</h1>
                    <p className="text-sm text-destructive-foreground mt-2">
                        Seeding is only allowed in development or test environments.
                    </p>
                </Card>
            </div>
        );
    }

    const handleSeed = async () => {
        if (!db) return;
        setLoading(true);
        setStatus([]);
        const logs: string[] = [];

        try {
            const { aiConfig, sessions, auditLogs } = getCollections(db);

            // 1. Initialize config-ai
            logs.push("Initializing 'config-ai'...");
            await setDoc(doc(aiConfig, "default"), {
                apiKey: "sk-placeholder-key-replace-me", // Placeholder
                model: "gpt-4-turbo-preview",
                temperature: 0.7,
                maxTokens: 500,
                provider: "openai"
            });
            logs.push("✅ 'config-ai/default' created.");

            // 2. Initialize sessions (Demo)
            logs.push("Initializing 'sessions'...");
            await setDoc(doc(sessions, "demo-session-001"), {
                id: "demo-session-001",
                agentId: "virtual-agent-001",
                installationId: "demo-install",
                channel: "web",
                status: "active",
                startTime: new Date().toISOString(),
                lastInteraction: new Date().toISOString(),
                summary: "This is a demo session to initialize the collection.",
                metadata: {
                    userAgent: "Mozilla/5.0",
                    initializedBy: "Admin Seeder"
                }
            });
            logs.push("✅ 'sessions/demo-session-001' created.");

            // 3. Initialize audit_logs (Demo)
            logs.push("Initializing 'audit_logs'...");
            await addDoc(auditLogs, {
                id: "init-log", // Firestore will ignore this if using addDoc, but we need it for type
                timestamp: new Date().toISOString(),
                actorId: "system-admin",
                action: "create",
                resource: "settings",
                resourceId: "init",
                changes: { description: "Database initialized" },
                ipAddress: "127.0.0.1"
            });
            logs.push("✅ 'audit_logs' entry created.");

            // 4. Initialize knowledge base (Sub-collection)
            logs.push("Initializing 'knowledge'...");
            // We need a dummy agent to attach knowledge to, or just use a placeholder ID
            const { knowledge } = getSubCollections(db);
            await addDoc(knowledge("placeholder-agent"), {
                id: "chunk-001",
                agentId: "placeholder-agent",
                content: "This is a sample knowledge chunk.",
                embedding: [0.1, 0.2, 0.3], // Dummy vector
                source: "manual-entry",
                createdAt: new Date().toISOString(),
                metadata: { tag: "sample" }
            });
            logs.push("✅ 'agents/placeholder-agent/knowledge' created.");

            // 5. Initialize Architect Agent Config
            logs.push("Initializing 'config-architect'...");
            const { architectConfig } = getCollections(db);
            const { architectAi } = getSubCollections(db);

            const architectId = "default"; // or tenantId

            // Personality
            await setDoc(doc(architectConfig, architectId), {
                name: "Aibot",
                role: "Arquitecto de Protocolos",
                systemPrompt: "Eres un arquitecto de agentes AI especializado en crear configuraciones eficientes.",
                updatedAt: new Date().toISOString()
            });

            // AI Settings (Sub-collection)
            await setDoc(doc(architectAi(architectId), "config"), {
                provider: "openai",
                model: "gpt-4-turbo",
                temperature: 0.7,
                maxTokens: 1000,
                apiKey: "sk-architect-placeholder", // Security: placeholder
                updatedAt: new Date().toISOString()
            });

            logs.push(`✅ 'config-architect/${architectId}' and its AI config created.`);

            setStatus(logs);

        } catch (error: any) {
            console.error(error);
            setStatus(prev => [...prev, `❌ Error: ${error.message}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-6 border-border/60 shadow-xl bg-card">
                <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary mb-2">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold">Initialize Database</h1>
                    <p className="text-sm text-muted-foreground">
                        This will create sample documents in the new collections to ensure they appear in the Firestore Console.
                    </p>
                </div>

                <div className="space-y-2 bg-muted/30 p-4 rounded-lg text-xs font-mono h-48 overflow-y-auto border border-border/40">
                    {status.length === 0 && <span className="text-muted-foreground opacity-50">Waiting to start...</span>}
                    {status.map((log, i) => (
                        <div key={i} className="flex gap-2">
                            <span>{log}</span>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        "Create Collections & Sample Data"
                    )}
                </Button>
            </Card>
        </div>
    );
}
