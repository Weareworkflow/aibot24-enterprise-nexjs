
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

/**
 * Endpoint de Instalación Vía API para Bitrix24.
 * Recibe el POST oficial de Bitrix con member_id y tokens.
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

    // Inicialización de Firebase en el servidor
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

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
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #F0F3F5; color: #333;">
          <div style="text-align: center; background: white; padding: 2rem; border-radius: 2rem; shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <h2 style="margin: 0 0 1rem 0;">AIBot24 - Instalación API</h2>
            <p style="color: #666; font-size: 14px;">Protocolo de enlace completado. Redirigiendo...</p>
          </div>
          <script>
            BX24.init(function() {
              console.log("Instalación finalizada vía API para member_id: ${memberId}");
              BX24.installFinish();
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
