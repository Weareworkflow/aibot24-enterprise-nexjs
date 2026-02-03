
# AIBot24 - Arquitecto de Agentes para Bitrix24

Esta es una solución profesional para la creación y gestión de agentes de IA (Voz y Texto) integrados en el ecosistema de Bitrix24.

## Configuración del Proyecto
- **Firebase Project ID**: `aibot24-485301`
- **Hosting Site**: `aibot24-voice`
- **Región**: Configurada para baja latencia en servicios de voz.

## Tecnologías Principales
- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: Google Cloud Firestore (Firebase)
- **IA**: Google Genkit + Gemini 2.5 Flash
- **Estilos**: Tailwind CSS + ShadCN UI
- **Estado**: Zustand (Persistencia local) + Firestore (Sincronización Cloud)

## Estructura de Datos
Los agentes se almacenan en la colección `agents` de Firestore con la siguiente estructura:
- `identity`: Nombre, Rol, Empresa, Objetivo.
- `instructions`: Tono de voz, Base de conocimiento (Large Text).
- `metrics`: Uso, performance, tokens y transferencias.
- `integrations`: Estado de conexión con servicios de Bitrix24 (WhatsApp, Calendario, Drive, etc).

## Despliegue
Configurado para funcionar como un Micro-App dentro del portal de Bitrix24, utilizando el sitio `aibot24-voice`.
