#!/bin/bash

# =================================================================
# PROYECTO: Agente de IA para Lecciones de Inglés
# DESCRIPCIÓN: Despliegue automático de imagen y respaldo de prompts.
# =================================================================

# 1. Empaquetado y Despliegue de la Infraestructura (Docker/K8s)
# -----------------------------------------------------------------
echo "🚀 Iniciando construcción de la imagen..."
docker build --no-cache -t workflow48/aibot24-enterprise-dashboard:latest .

echo "📦 Subiendo imagen al registro..."
docker push workflow48/aibot24-enterprise-dashboard:latest
# Reinicio del despliegue en Kubernetes para aplicar cambios en el agente[cite: 119].
echo "🔄 Reiniciando despliegue en Kubernetes..."
kubectl rollout restart deployment/aibot24-enterprise-dashboard -n apps


# 2. Respaldo Automático en GitHub
# -----------------------------------------------------------------
echo "📂 Sincronizando código y prompts con GitHub..."

# Capturamos la fecha y hora para el mensaje genérico
TIMESTAMP=$(date +'%Y-%m-%d %H:%M')
GENERIC_COMMENT="Auto-update: Refinamiento de lógica de corrección y prompts"

git add .

# Ejecutamos el commit sin intervención manual para agilizar el workflow.
git commit -m "$GENERIC_COMMENT [$TIMESTAMP]"

echo "⬆️ Subiendo cambios a la rama principal..."
git push origin main

echo "✅ Proceso completado exitosamente el $TIMESTAMP."