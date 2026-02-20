import { streamText, openai, defaultModel } from '@/lib/config-ai';
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
        const { currentConfig, feedback, metaSystemPrompt, tenantId } = RefineBodySchema.parse({ ...json, tenantId: json.memberId || json.tenantId });

        if (!tenantId) {
            return new Response("Configuration Error: Missing tenantId (Domain) context", { status: 400 });
        }

        // 1. Fetch Global System Prompt (Architect Profile fallback) from config-app
        const configRef = db.collection('config-app').doc(tenantId);
        const configSnap = await configRef.get();
        const configData = configSnap.exists ? configSnap.data() : null;

        const defaultSystemPrompt = configData?.systemPrompt || `Eres el Arquitecto Senior de IA de AIBot24. Tu misión es redactar el SYSTEM PROMPT más avanzado para un agente integrado en Bitrix24.
    
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
            model: defaultModel,
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
