
import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

/**
 * Endpoint de Instalación Vía API para Bitrix24.
 * Registra la instalación utilizando el motor unificado de base de datos.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const memberId = formData.get('member_id') as string;
    const domain = formData.get('DOMAIN') as string;
    const accessToken = formData.get('AUTH_ID') as string;
    const refreshToken = formData.get('REFRESH_ID') as string;
    const expiresIn = parseInt(formData.get('AUTH_EXPIRES') as string || '3600');

    if (!memberId) {
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 });
    }

    const installationData = {
      memberId,
      domain: domain || "unknown",
      accessToken: accessToken || "",
      refreshToken: refreshToken || "",
      expiresIn,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Registro de la instalación en Firestore
    await setDoc(doc(db, 'installations', memberId), installationData);

    // Retornamos HTML que llama al SDK de Bitrix para finalizar la instalación en el UI
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="//api.bitrix24.com/api/v1/"></script>
        </head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #060e1f; color: #fff; margin: 0;">
          <div style="text-align: center; background: #0c1830; padding: 2.5rem; border-radius: 2rem; box-shadow: 0 20px 50px rgba(0,0,0,0.3); max-width: 400px; width: 90%; border: 1px solid rgba(255,255,255,0.1);">
            <div style="color: #2FC6F6; margin-bottom: 1rem;">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2 style="margin: 0 0 1rem 0; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">AIBot24 Enterprise</h2>
            <p style="color: #2FC6F6; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">Enlace Exitoso</p>
            <div style="margin: 1.5rem 0; font-family: monospace; font-size: 11px; color: #94a3b8; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 1rem;">ID: ${memberId}</div>
            <p style="color: #64748b; font-size: 10px;">Finalizando protocolo de instalación...</p>
          </div>
          <script>
            BX24.init(function() {
              console.log("Instalación completada para: ${memberId}");
              setTimeout(function() {
                BX24.installFinish();
              }, 1500);
            });
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Error', message: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('API Endpoint Active', { status: 200 });
}
