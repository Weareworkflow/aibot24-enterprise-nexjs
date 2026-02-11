
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { FirebaseErrorListener } from "@/components/firebase/FirebaseErrorListener";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: 'AIBot24 - Intelligent Voice Agents',
  description: 'Create and manage customizable AI voice agents with advanced personality tuning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {isDev && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined' && !window.BX24) {
                  window.BX24 = {
                    init: (callback) => {
                      console.log("[DEV MOCK] BX24.init simulado para localhost");
                      if (callback) setTimeout(callback, 100);
                    },
                    installFinish: () => {
                      console.log("[DEV MOCK] BX24.installFinish simulado - Instalación completada");
                    },
                    getAuth: () => {
                      console.log("[DEV MOCK] BX24.getAuth simulado");
                      return {
                        member_id: "dev_member_local",
                        domain: "dev-portal.bitrix24.es",
                        access_token: "dev_access_token",
                        refresh_token: "dev_refresh_token",
                        expires_in: 3600
                      };
                    },
                    callMethod: (method, params, callback) => {
                      console.log("[DEV MOCK] BX24.callMethod simulado:", method, params);
                      if (callback) setTimeout(() => callback({ result: "OK", error: null }), 300);
                    }
                  };
                }
              `,
            }}
          />
        )}
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
            <FirebaseErrorListener />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
