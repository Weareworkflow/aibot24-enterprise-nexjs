# AIBot24 - Arquitecto de Agentes para Bitrix24

Esta es una solución profesional para la creación y gestión de agentes de IA integrados en el ecosistema de Bitrix24, utilizando una arquitectura moderna y escalable.

## Tecnologías Principales
- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: MongoDB (Motor central de datos)
- **IA**: Vercel AI SDK + OpenAI (GPT-4o)
- **Estilos**: Tailwind CSS + ShadCN UI
- **Estado**: Zustand (Gestión en cliente) + MongoDB API (Sincronización en servidor)

## Estructura de Identidad (Llaves Rápidas)
El sistema utiliza un formato de identificador único diseñado para alta velocidad en eventos de Bitrix:
- **Agentes**: `id` = `{dominio}-{bitrixBotId}` (ej: portal.bitrix24.es-101)
- **Instalaciones**: `id` = `{dominio}`
- **Configuración**: `id` = `{dominio}`
- **Métricas**: `agentId` = `{dominio}-{bitrixBotId}`

## Estructura de Datos (MongoDB)
- **`agents`**: Almacena el nombre, rol, empresa y el System Prompt específico de cada agente.
- **`config-app`**: Ajustes globales del portal, tema e idioma, junto con el System Prompt Global configurado por el administrador.
- **`installations`**: Credenciales OAuth (Access/Refresh Tokens) y estado de la instalación en Bitrix24.
- **`metrics`**: Estadísticas de rendimiento (uso, tokens, reuniones, etc) vinculadas por Agent ID.

## Flujo de Registro
1. El usuario inicia la creación de un agente en el Dashboard.
2. El sistema reserva y registra el bot en Bitrix24 (vía API REST).
3. Con el ID devuelto por Bitrix, se construye la identidad final y se guarda en MongoDB.

## Seguridad e Integridad
- MongoDB utiliza **Índices Únicos Compuestos** para garantizar que no existan bots duplicados en un mismo portal.
- Los secretos de Bitrix24 se gestionan de forma segura y se refrescan automáticamente mediante el servicio de integración.
