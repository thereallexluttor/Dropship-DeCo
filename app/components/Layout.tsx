import { ReactNode } from 'react'
import Header from './Header'
import { motion } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
  categories: any[] // Replace with proper type from your data
}

export default function Layout({ children, categories }: LayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      <Header categories={categories} />
      <main className="pt-20">
        {children}
      </main>
      {/* Footer will be added here */}
    </motion.div>
  )
} 