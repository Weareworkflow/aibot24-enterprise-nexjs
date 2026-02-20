import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

/**
 * Endpoint de Instalación Vía API para Bitrix24.
 * Este es el "Install URL" que Bitrix24 llama mediante POST al instalar la app.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Captura de datos del POST de Bitrix24
    const memberId = formData.get('member_id') as string;
    const domain = formData.get('DOMAIN') as string;
    const accessToken = formData.get('AUTH_ID') as string;
    const refreshToken = formData.get('REFRESH_ID') as string;
    const expiresIn = parseInt(formData.get('AUTH_EXPIRES') as string || '3600');

    if (!memberId) {
      console.error("Instalación fallida: Falta member_id");
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 });
    }

    const installationData = {
      memberId,
      domain: domain || "unknown",
      accessToken: accessToken || "",
      refreshToken: refreshToken || "",
      expiresIn,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn
    };

    // 1. Registro principal en Firestore (ID = DOMAIN)
    await db.collection('installations').doc(domain).set(installationData, { merge: true });
    console.log(`✅ Instalación registrada: installations/${domain}`);

    // 2. Auto-inicializar colecciones dependientes (merge: true preserva datos existentes)
    const initPromises: Promise<any>[] = [];

    // config-app/{domain} — UI Settings
    initPromises.push(
      db.collection('config-app').doc(domain).set({
        theme: 'system',
        language: 'es',
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );

    // config-app/{domain} — UI Settings & Global Prompt
    initPromises.push(
      db.collection('config-app').doc(domain).set({
        theme: 'dark',
        language: 'es',
        systemPrompt: 'Eres un experto en Bitrix24 que ayuda a los usuarios.',
        updatedAt: new Date().toISOString()
      }, { merge: true })
    );

    await Promise.all(initPromises);
    console.log(`✅ Colección config-app inicializada para ${domain}`);

    // HTML de finalización: Carga el SDK y notifica a Bitrix que la instalación terminó
    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <script src="//api.bitrix24.com/api/v1/"></script>
          <style>
            body { 
              margin: 0; 
              background: #060e1f; 
              color: #fff; 
              font-family: 'Inter', sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              overflow: hidden;
            }
            .card {
              background: #0c1830;
              padding: 3rem;
              border-radius: 2.5rem;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              text-align: center;
              max-width: 420px;
              width: 90%;
              border: 1px solid rgba(47, 198, 246, 0.2);
              animation: fadeIn 0.6s ease-out;
            }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .icon { color: #2FC6F6; margin-bottom: 1.5rem; }
            h2 { margin: 0 0 0.5rem 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
            .status { color: #2FC6F6; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 2rem; }
            .loader { 
              width: 40px; height: 40px; border: 3px solid rgba(47, 198, 246, 0.1); 
              border-top-color: #2FC6F6; border-radius: 50%; 
              animation: spin 1s linear infinite; margin: 0 auto 1.5rem;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            .footer { color: #64748b; font-size: 11px; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="loader"></div>
            <h2>AIBot24 Enterprise</h2>
            <div class="status">Sincronizando Protocolo</div>
            <p class="footer">Finalizando enlace seguro con Bitrix24...</p>
          </div>
          <script>
            BX24.init(function() {
              console.log("Instalación completada para: ${memberId}");
              // Crucial: BX24.installFinish() cierra el flujo de instalación y redirige al App URL
              setTimeout(function() {
                BX24.installFinish();
              }, 1000);
            });
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    console.error("Error en POST /api/install:", error);
    return NextResponse.json({ error: 'Internal Error', message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Endpoint Operativo - Esperando POST de Bitrix24', { status: 200 });
}
