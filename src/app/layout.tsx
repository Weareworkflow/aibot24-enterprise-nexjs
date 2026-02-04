import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from "@/firebase";
import { FirebaseErrorListener } from "@/components/firebase/FirebaseErrorListener";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {isDev && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (!window.BX24) {
                  window.BX24 = {
                    init: (callback) => {
                      console.log("[DEV MOCK] BX24.init simulado para localhost");
                      if (callback) callback();
                    },
                    installFinish: () => {
                      console.log("[DEV MOCK] BX24.installFinish simulado");
                    },
                    getAuth: () => {
                      console.log("[DEV MOCK] BX24.getAuth simulado");
                      return null;
                    },
                    callMethod: (method, params, callback) => {
                      console.log("[DEV MOCK] BX24.callMethod simulado:", method, params);
                      // En desarrollo, esto evita errores de referencia
                      if (callback) callback({ error: "SDK simulado en modo desarrollo" });
                    }
                  };
                }
              `,
            }}
          />
        )}
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          {children}
          <Toaster />
          <FirebaseErrorListener />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
