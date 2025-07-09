"use client"

import { Metadata } from 'next'
import { useSession } from 'next-auth/react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const userRole = session?.user?.role

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Portal</h2>
            <p className="text-sm text-gray-600">EduScope Management</p>
          </div>
          <nav className="mt-6">
            <a href="/admin" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 border-r-2 border-transparent hover:border-blue-500">
              Dashboard
            </a>
            <a href="/admin/research" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 border-r-2 border-transparent hover:border-blue-500">
              Research Papers
            </a>
            <a href="/admin/ideas" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 border-r-2 border-transparent hover:border-blue-500">
              Ideas
            </a>
            <a href="/admin/pending-requests" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 border-r-2 border-transparent hover:border-blue-500">
              Pending Requests
            </a>
            {userRole === 'admin' && (
              <a href="/admin/users" className="block px-6 py-3 text-gray-700 hover:bg-gray-100 border-r-2 border-transparent hover:border-blue-500">
                Users
              </a>
            )}
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm border-b p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Main Site
              </a>
            </div>
          </header>
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
