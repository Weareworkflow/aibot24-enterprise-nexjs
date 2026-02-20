import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';

/**
 * Configuración centralizada para Vercel AI SDK.
 * Utiliza variables de entorno para mayor seguridad y facilidad de despliegue.
 */

// 1. Instancia del proveedor OpenAI
// La API Key se toma automáticamente de process.env.OPENAI_API_KEY
export const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 2. Modelo predeterminado para el Arquitecto de Prompts
export const defaultModel = openai('gpt-4o');

// 3. Configuración del Bot de Bitrix
export const bitrixConfig = {
    handlerUrl: process.env.BITRIX_BOT_HANDLER_URL,
};

/**
 * Exportación de utilidades comunes del SDK para uso en toda la app.
 */
export { generateText, streamText };
