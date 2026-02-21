# Gestión de Entorno de Producción

Este proyecto está configurado para operar exclusivamente en entornos de producción integrados con Bitrix24. No se utilizan entornos locales de prueba con mocks.

## Conexión a Base de Datos
- **Variable**: `MONGODB_URI`
- **Uso**: Conexión obligatoria al clúster de MongoDB. Asegúrate de que el clúster sea accesible desde tu entorno de ejecución (ej: Kubernetes).

## Integración con Bitrix24
- La aplicación requiere ser ejecutada dentro de un portal de Bitrix24 para que el SDK (`BX24`) funcione correctamente.
- No existe el "Modo Local" o "Anónimo". Todas las operaciones de creación de agentes validan el `tenantId` (dominio del portal).

## Despliegue en Kubernetes
- Las variables de entorno se gestionan vía `ConfigMap` y `Secret` en Kubernetes.
- No es necesario mantener un archivo `.env` en el servidor, ya que el clúster inyecta los valores directamente.

## Auditoría Final
- Se han eliminado todos los scripts de simulación y mocks de desarrollo.
- El archivo de configuración maestro es `.env.local` solo para propósitos de despliegue inicial.
