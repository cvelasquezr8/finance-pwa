import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/inter'
import '@fontsource/geist-mono'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Finance Manager',
  description: 'Personal finance management with bi-weekly budgeting',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinanceApp',
  },
}

export const viewport: Viewport = {
  themeColor: '#1c1917',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/*
          dangerouslySetInnerHTML is safe here: __html is a hardcoded
          string literal with no user input interpolated. The runtime
          localStorage value is whitelisted to 'dark'|'light' before
          being passed to classList.add(), preventing class injection.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem('finance_user');
                var theme = 'dark';
                if (s) {
                  var t = JSON.parse(s).theme;
                  if (t === 'light' || t === 'dark') theme = t;
                }
                document.documentElement.classList.add(theme);
              } catch(e) { document.documentElement.classList.add('dark'); }
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
