import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    const text = await request.text();

    // Log the raw body for easier debugging of installation issues
    console.log('[Install] Received body:', text);

    try {
      // Try parsing as JSON first
      body = JSON.parse(text);
    } catch (e) {
      // Fallback: Parse as URL Search Params (Form Data)
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }

    // Capture DOMAIN from query string as ultimate fallback
    const queryDomain = request.nextUrl.searchParams.get('DOMAIN');

    // Normalize Bitrix24 properties if they are at the root
    if (body.AUTH_ID && !body.auth) {
      body.auth = {
        access_token: body.AUTH_ID,
        refresh_token: body.REFRESH_ID,
        domain: body.DOMAIN,
        member_id: body.MEMBER_ID,
        expires_in: body.AUTH_EXPIRES,
      };
    }

    const {
      event,
      auth,
      data
    } = body;

    // Helper to get property case-insensitively
    const getProp = (obj: any, key: string) => {
      if (!obj) return undefined;
      return obj[key] || obj[key.toUpperCase()] || obj[key.toLowerCase()];
    };

    // Datos del evento de instalación de Bitrix24
    // Check in auth, data, then root body
    const memberId = getProp(auth, 'member_id') || getProp(data, 'MEMBER_ID') || getProp(body, 'MEMBER_ID') || getProp(body, 'member_id');
    const domain = getProp(auth, 'domain') || getProp(data, 'DOMAIN') || getProp(body, 'DOMAIN') || getProp(body, 'domain') || queryDomain;
    const accessToken = getProp(auth, 'access_token') || getProp(data, 'AUTH_ID') || getProp(body, 'AUTH_ID') || getProp(body, 'auth_id');
    const refreshToken = getProp(auth, 'refresh_token') || getProp(data, 'REFRESH_ID') || getProp(body, 'REFRESH_ID') || getProp(body, 'refresh_id');
    const expiresInRaw = getProp(auth, 'expires_in') || getProp(data, 'AUTH_EXPIRES') || getProp(body, 'AUTH_EXPIRES') || "3600";
    const expiresIn = parseInt(expiresInRaw.toString());

    // User data for access control
    const userId = getProp(auth, 'user_id') || getProp(body, 'USER_ID') || getProp(body, 'user_id');
    const userName = ""; // Can be enriched later or captured if present

    if (!memberId) {
      console.error('[Install] Failed to extract memberId from body:', JSON.stringify(body, null, 2));
      return NextResponse.json({ error: 'Missing member_id' }, { status: 400 });
    }

    if (!domain) {
      console.error('[Install] WARNING: domain is missing. Access API might fail. Body:', JSON.stringify(body, null, 2));
    }

    const db = await getDb();

    // The key for lookups should be the domain if available, fallback to memberId for internal indexing
    const installKey = domain || memberId;

    // Guardar/actualizar instalación con patrón find+update/insert
    // Evita E11000: upsert con $or en MongoDB no es compatible con índices únicos
    const existingInstallation = await db.collection('installations').findOne({
      $or: [
        { memberId },
        ...(domain ? [{ domain }] : [])
      ]
    });

    const installData = {
      memberId,
      domain: domain || installKey,
      accessToken: accessToken || '',
      refreshToken: refreshToken || '',
      expiresIn,
      expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      status: 'active' as const,
      updatedAt: new Date().toISOString(),
    };

    if (existingInstallation) {
      await db.collection('installations').updateOne(
        { _id: existingInstallation._id },
        { $set: installData }
      );
    } else {
      await db.collection('installations').insertOne({
        id: memberId,
        ...installData,
        createdAt: new Date().toISOString(),
      });
    }

    // Track the user if available
    if (userId && domain) {
      const memberIdKey = `${domain}-${userId}`;
      const existingMembersCount = await db.collection('members').countDocuments({ domain });

      await db.collection('members').updateOne(
        { id: memberIdKey },
        {
          $set: {
            userId,
            domain,
            lastVisit: new Date().toISOString()
          },
          $setOnInsert: {
            id: memberIdKey,
            userName: userName || `User ${userId}`,
            role: existingMembersCount === 0 ? 'admin' : 'viewer',
            addedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
    }

    // Inicializar config-app si no existe
    const existingConfig = await db.collection('config-app').findOne({ tenantId: installKey });
    if (!existingConfig) {
      await db.collection('config-app').insertOne({
        id: installKey, // ID explícito según nuevo estándar
        tenantId: installKey,
        theme: 'light',
        language: 'es',
        systemPrompt: '',
        createdAt: new Date().toISOString(),
      });
    }

    console.log(`[Install] Successful for domain: ${installKey}, event: ${event}`);

    // Redirigir al dashboard usando el host público desde los headers
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const redirectUrl = `${protocol}://${host}/?DOMAIN=${encodeURIComponent(installKey)}&member_id=${encodeURIComponent(memberId)}`;

    return NextResponse.redirect(redirectUrl, { status: 303 });

  } catch (error: any) {
    console.error('[Install] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
