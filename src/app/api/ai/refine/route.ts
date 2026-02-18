import { streamText } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/firebase-admin';

export const maxDuration = 30;

const RefineBodySchema = z.object({
    currentConfig: z.object({
        name: z.string().optional().default("Agente"),
        role: z.string().optional().default("Asistente"),
        company: z.string().optional().default("Empresa"),
        systemPrompt: z.string().optional().default(""),
    }),
    feedback: z.string(),
    metaSystemPrompt: z.string().optional(),
    tenantId: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const json = await req.json();
        // Expect 'tenantId' (which is the Domain) from the client
        const { currentConfig, feedback, metaSystemPrompt, tenantId } = RefineBodySchema.parse({ ...json, tenantId: json.memberId || json.tenantId }); // Fallback for backward compat during dev

        if (!tenantId) {
            return new Response("Configuration Error: Missing tenantId (Domain) context", { status: 400 });
        }

        // 1. Fetch Global AI Configuration
        const globalAiRef = db.collection('settings').doc('ai');
        const globalAiSnap = await globalAiRef.get();

        let apiKey, provider, modelName;

        if (globalAiSnap.exists) {
            const globalConfig = globalAiSnap.data()!;
            apiKey = globalConfig.apiKey;
            provider = globalConfig.provider || 'openai';
            modelName = globalConfig.model || 'gpt-4o';
        }

        if (!apiKey || apiKey.includes("ENTER_GLOBAL_API_KEY")) {
            console.error("❌ Global API Key is missing or invalid in Firestore (settings/ai)");
            return new Response("Configuration Error: Global API Key not configured in Firestore", { status: 500 });
        }

        // 2. Fetch Architect Profile (Personality) - Keyed by Domain
        const architectRef = db.collection('config-architect').doc(tenantId);
        const architectSnap = await architectRef.get();

        if (!architectSnap.exists) {
            return new Response(`Configuration Error: Architect profile not found for domain ${tenantId}`, { status: 404 });
        }

        const architectConfig = architectSnap.data()!;

        // Initialize AI Provider Dynamically
        let aiModel;

        if (provider === 'openai') {
            const { createOpenAI } = require('@ai-sdk/openai');
            const openai = createOpenAI({ apiKey });
            aiModel = openai(modelName);
        } else if (provider === 'google') {
            const { createGoogleGenerativeAI } = require('@ai-sdk/google');
            const google = createGoogleGenerativeAI({ apiKey });
            aiModel = google(modelName);
        } else {
            return new Response(`Configuration Error: Unsupported provider ${provider}`, { status: 400 });
        }

        const defaultSystemPrompt = architectConfig.systemPrompt || `Eres el Arquitecto Senior de IA de AIBot24. Tu misión es redactar el SYSTEM PROMPT más avanzado para un agente integrado en Bitrix24.
    
    DIRECTRICES CRÍTICAS:
    1. Tu respuesta se mostrará en streaming al usuario.
    2. PRIMERO: Escribe una explicación MUY BREVE y profesional (texto plano, SIN ASTERISCOS, SIN MARKDOWN, no uses negritas). Dile qué cambios hiciste.
    3. SEGUNDO: Deja dos saltos de línea y escribe un bloque de código markdown con el SYSTEM PROMPT completo y actualizado.
       Ejemplo de formato:
       He actualizado el system prompt para incluir...
    
       \`\`\`markdown
       # SYSTEM PROMPT
       Eres un agente de...
       ...
       \`\`\`
    4. El bloque de código debe contener TODO el System Prompt actualizado, incluyendo rol, personalidad, reglas y protocolos.`;

        const result = streamText({
            model: aiModel,
            system: metaSystemPrompt || defaultSystemPrompt,
            prompt: `
    DATOS DEL AGENTE:
    - Nombre: ${currentConfig.name}
    - Rol: ${currentConfig.role}
    - Empresa: ${currentConfig.company}
    
    SYSTEM PROMPT ACTUAL:
    """
    ${currentConfig.systemPrompt}
    """
    
    NUEVAS INDICACIONES DEL USUARIO:
    "${feedback}"`,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("❌ Error in /api/ai/refine:", error);
        return new Response(`Refinement Error: ${error.message}`, { status: 500 });
    }
}
