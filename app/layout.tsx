import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nuro — Unified Messaging & Brain Health',
  description: 'All your DMs in one place. AI-powered brain health scoring. Authentic moments. Stop scrolling. Start living.',
  keywords: ['unified inbox', 'brain health', 'social media wellness', 'messaging', 'WhatsApp', 'Instagram', 'Discord'],
  openGraph: {
    title: 'Nuro — Unified Messaging & Brain Health',
    description: 'All your DMs. Your mind, protected.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  )
}
