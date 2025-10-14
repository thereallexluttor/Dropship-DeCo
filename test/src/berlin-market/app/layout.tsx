import type { Metadata, Viewport } from 'next'
import './globals.css'
import { CategoryProvider } from './contexts/CategoryContext'
import { CartProvider } from './contexts/CartContext'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          <CartProvider>
            {children}
          </CartProvider>
        </CategoryProvider>
      </body>
    </html>
  )
}
