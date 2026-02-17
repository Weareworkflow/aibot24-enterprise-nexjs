# Configuración de Entornos (Español)

He separado exitosamente tus entornos de la siguiente manera:

1.  **Sistema de Prefijos**: La aplicación ahora agrega automáticamente un prefijo (`test_` o `prod_`) a todas las colecciones de Firestore, dependiendo del entorno en el que te encuentres.

2.  **Entorno Local (Test)**: 
    - He configurado tu archivo `.env.local` con `NEXT_PUBLIC_APP_ENV=test`.
    - Esto significa que tu aplicación local ahora leerá y escribirá en colecciones que comienzan con `test_` (ejemplo: `test_agents`).
    - **Importante**: Al cambiar a este nuevo prefijo, tu aplicación parecerá vacía inicialmente, ya que los datos antiguos no se migran automáticamente.
    - **Solución**: Debes ir a la página `/seed` en tu navegador y hacer clic en el botón de inicialización para poblar este nuevo entorno de pruebas con datos de ejemplo.

3.  **Producción**: 
    - Cuando despliegues la aplicación (o si eliminas la variable `NEXT_PUBLIC_APP_ENV`), el sistema usará los nombres de colección estándar (sin prefijo `test_`), manteniendo tus datos reales seguros y separados.

## Resumen de Acción
ve a **`http://localhost:3000/seed`** y haz clic en **"Create Collections & Sample Data"** para reactivar tu entorno local.
