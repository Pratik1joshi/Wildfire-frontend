"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
  const { isAdmin, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    
    if (!isAdmin()) {
      router.push('/')
      return
    }
  }, [isAuthenticated, isAdmin, router])
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white font-bold text-xl">
          LiveFire Admin
        </div>
        <nav className="mt-5 px-2">
          <Link href="/admin/dashboard" className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i className="ri-dashboard-line mr-3 text-gray-400 group-hover:text-blue-500"></i>
            Dashboard
          </Link>
          <Link href="/admin/users" className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i className="ri-user-settings-line mr-3 text-gray-400 group-hover:text-blue-500"></i>
            Users
          </Link>
          <Link href="/admin/alerts" className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i className="ri-alarm-warning-line mr-3 text-gray-400 group-hover:text-blue-500"></i>
            Alerts
          </Link>
          <Link href="/admin/prediction-alerts" className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i className="ri-fire-line mr-3 text-gray-400 group-hover:text-blue-500"></i>
            Prediction Alerts
          </Link>
          <Link href="/admin/settings" className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i className="ri-settings-line mr-3 text-gray-400 group-hover:text-blue-500"></i>
            Settings
          </Link>
          <Link href="/" className="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-600">
            <i className="ri-home-line mr-3 text-gray-400 group-hover:text-blue-500"></i>
            Back to Site
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm flex-shrink-0">
          <div className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center lg:hidden">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="-ml-1 p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none">
                <i className="ri-menu-line text-xl"></i>
              </button>
            </div>
            <div className="text-xl font-semibold text-gray-800">{title}</div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {user?.full_name || 'Admin'}
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                {(user?.full_name || 'A').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  )
}
