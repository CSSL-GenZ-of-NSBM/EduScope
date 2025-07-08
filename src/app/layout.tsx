import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from "@/components/providers"
import Navbar from "@/components/layout/Navbar"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EduScope - NSBM Green University Research Platform',
  description: 'A comprehensive academic platform for NSBM Green University students to share research papers, projects, ideas, and get degree guidance.',
  keywords: ['NSBM', 'academic', 'research', 'education', 'university', 'papers', 'projects'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/logo.png',
  },
  openGraph: {
    title: 'EduScope - NSBM Green University Research Platform',
    description: 'A comprehensive academic platform for NSBM Green University students to share research papers, projects, ideas, and get degree guidance.',
    images: ['/images/logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
