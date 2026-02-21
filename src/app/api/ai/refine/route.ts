import { streamText } from 'ai';
import { openai, defaultModel } from '@/lib/config-ai';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { currentConfig, feedback, tenantId } = await request.json();

        if (!feedback) {
            return new Response('Feedback is required', { status: 400 });
        }

        // Fetch global system prompt (Architect Protocol) from config-app
        let architectProtocol = '';
        if (tenantId) {
            try {
                const db = await getDb();
                const config = await db.collection('config-app').findOne({ tenantId });
                if (config?.systemPrompt) {
                    architectProtocol = config.systemPrompt;
                }
            } catch (e) {
                console.warn('[Refine] Could not fetch global config:', e);
            }
        }

        const systemPrompt = architectProtocol
            ? `${architectProtocol}\n\n---\nAhora, actúa como un Arquitecto de System Prompts. Refina el protocolo del agente según las instrucciones del usuario.`
            : `Eres un experto en diseño de System Prompts para agentes de IA. Tu trabajo es refinar y mejorar el System Prompt de un agente según las instrucciones del usuario.`;

        const result = streamText({
            model: defaultModel,
            system: systemPrompt,
            prompt: `## Configuración Actual del Agente:
- Nombre: ${currentConfig.name}
- Rol: ${currentConfig.role}
- Empresa: ${currentConfig.company}
- System Prompt Actual:
\`\`\`
${currentConfig.systemPrompt}
\`\`\`

## Instrucción del Usuario:
"${feedback}"

## Tu Tarea:
1. Analiza la instrucción del usuario.
2. Explica brevemente qué cambios harás y por qué.
3. Al final, incluye el System Prompt completo y actualizado dentro de un bloque \`\`\`markdown ... \`\`\`.`,
            temperature: 0.7,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('[Refine] Error:', error);
        return new Response(error.message || 'Internal error', { status: 500 });
    }
}
