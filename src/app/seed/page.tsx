"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCollections } from "@/lib/db-schema";
import { useFirestore } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { Loader2, AlertTriangle } from "lucide-react";

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
            const { agents, installations, appConfig } = getCollections(db);

            // 1. Initialize Agents
            logs.push("Initializing 'agents'...");
            await setDoc(doc(agents, "demo-agent-001"), {
                id: "demo-agent-001",
                tenantId: "workflowteams.bitrix24.es",
                name: "Demo Agent",
                type: "text",
                role: "Asistente",
                company: "Retail",
                color: "#ff0000",
                systemPrompt: "Eres un asistente de prueba.",
                isActive: true
            });
            logs.push("✅ 'agents/demo-agent-001' created.");

            // 2. Initialize installations
            logs.push("Initializing 'installations'...");
            await setDoc(doc(installations, "demo-install-001"), {
                memberId: "demo-member-001",
                domain: "workflowteams.bitrix24.es",
                status: "active",
                accessToken: "dummy-access",
                refreshToken: "dummy-refresh",
                expiresIn: 3600,
                clientSecret: "dummy-secret",
                clientId: "dummy-id"
            });
            logs.push("✅ 'installations/demo-install-001' created.");

            // 3. Initialize app-config
            logs.push("Initializing 'config-app'...");
            await setDoc(doc(appConfig, "workflowteams.bitrix24.es"), {
                theme: "light",
                language: "es",
                systemPrompt: "Global system prompt placeholder",
                tenantId: "workflowteams.bitrix24.es"
            });
            logs.push("✅ 'config-app/workflowteams.bitrix24.es' created.");

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
