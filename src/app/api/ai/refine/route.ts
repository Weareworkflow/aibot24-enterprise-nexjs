import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const RefineBodySchema = z.object({
    currentConfig: z.object({
        name: z.string().optional().default("Agente"),
        role: z.string().optional().default("Asistente"),
        company: z.string().optional().default("Empresa"),
        objective: z.string().optional().default("Atención al cliente"),
        tone: z.string().optional().default("Profesional"),
        knowledge: z.string().optional().default(""),
        activeIntegrations: z.array(z.string()).optional().default([]),
    }),
    feedback: z.string(),
    metaSystemPrompt: z.string().optional(),
});

export async function POST(req: Request) {
    const json = await req.json();
    const { currentConfig, feedback, metaSystemPrompt } = RefineBodySchema.parse(json);

    const defaultSystemPrompt = `Eres el Arquitecto Senior de IA de AIBot24. Tu misión es redactar el SYSTEM PROMPT más avanzado para un agente integrado en Bitrix24.

DIRECTRICES CRÍTICAS:
1. Tu respuesta se mostrará en streaming al usuario.
2. PRIMERO: Escribe una explicación MUY BREVE y profesional (texto plano, SIN ASTERISCOS, SIN MARKDOWN, no uses negritas). Dile qué cambios hiciste.
3. SEGUNDO: Deja dos saltos de línea y escribe un bloque de código markdown con el nuevo 'knowledge' completo.
   Ejemplo de formato:
   He actualizado el protocolo para incluir...

   \`\`\`markdown
   # NUEVO PROTOCOLO
   ...
   \`\`\`
4. El bloque de código debe contener TODO el knowledge actualizado.`;

    const result = streamText({
        model: openai('gpt-4o'),
        system: metaSystemPrompt || defaultSystemPrompt,
        prompt: `
DATOS DEL AGENTE:
- Nombre: ${currentConfig.name}
- Rol: ${currentConfig.role}
- Empresa: ${currentConfig.company}
- Tono: ${currentConfig.tone}
- Objetivo: ${currentConfig.objective}

CAPACIDADES TECNOLÓGICAS (Integraciones activas):
${currentConfig.activeIntegrations.map((i: string) => `- ${i}`).join('\n')}

MANUAL ACTUAL:
"""
${currentConfig.knowledge}
"""

NUEVAS INDICACIONES DEL USUARIO:
"${feedback}"`,
    });

    return result.toDataStreamResponse();
}
