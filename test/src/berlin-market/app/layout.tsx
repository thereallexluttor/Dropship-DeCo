import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CategoryProvider } from './contexts/CategoryContext'
import { CartProvider } from './contexts/CartContext'
import { CartNotificationProvider } from './contexts/CartNotificationContext'

export const metadata: Metadata = {
  title: {
    default: 'Unisantander | Insumos agropecuarios y salud',
    template: '%s | Unisantander',
  },
  description:
    'Brindamos insumos agropecuarios y productos farmacéuticos de alta calidad con asesoría técnica y profesional. Comprometidos con la sostenibilidad, la innovación y el bienestar de las comunidades.',
  keywords: [
    'Unisantander',
    'insumos agropecuarios',
    'productos farmacéuticos',
    'veterinaria',
    'campo',
    'sostenibilidad',
    'innovación',
    'Colombia',
    'tienda',
  ],
  applicationName: 'Unisantander',
  authors: [{ name: 'Unisantander' }],
  creator: 'Unisantander',
  publisher: 'Unisantander',
  category: 'commerce',
  alternates: { canonical: '/' },
  icons: {
    icon: '/img/icon.png',
    shortcut: '/img/icon.png',
    apple: '/img/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: '/',
    siteName: 'Unisantander',
    title: 'Unisantander | Insumos agropecuarios y salud',
    description:
      'Soluciones integrales en insumos agropecuarios y productos farmacéuticos con servicio humano y cercano.',
    images: [
      {
        url: '/unisantander.png',
        width: 1200,
        height: 630,
        alt: 'Unisantander',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unisantander | Insumos agropecuarios y salud',
    description:
      'Calidad, servicio humano y cercanía para el campo y la salud en Colombia.',
    images: ['/unisantander.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  generator: 'v0.dev',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#196428',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CategoryProvider>
          <CartNotificationProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CartNotificationProvider>
        </CategoryProvider>
      </body>
    </html>
  )
}
