"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' 
import { useAuth } from '@/contexts/auth-context'
import adminApi from '@/services/admin-api'
import AdminLayout from '@/components/admin/layout'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    
    if (!isAdmin()) {
      router.push('/')
      return
    }
    
    fetchData()
  }, [isAuthenticated, isAdmin, router])
  
  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersData, alertsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getAlerts()
      ])
      
      setUsers(usersData)
      setAlerts(alertsData)
      setError(null)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'danger':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }
  
  return (
    <AdminLayout title="Dashboard">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <i className="ri-user-line text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase font-medium">Total Users</p>
              <p className="text-2xl font-semibold">{users.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <i className="ri-alarm-warning-line text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase font-medium">Active Alerts</p>
              <p className="text-2xl font-semibold">{alerts.filter(a => a.is_active).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <i className="ri-admin-line text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase font-medium">Admin Users</p>
              <p className="text-2xl font-semibold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-500">
              <i className="ri-fire-line text-2xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 uppercase font-medium">High Risk Alerts</p>
              <p className="text-2xl font-semibold">{alerts.filter(a => a.level === 'danger').length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {users.slice(0, 5).map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            
            {users.length === 0 && (
              <li className="px-6 py-4 text-center text-gray-500">No users found</li>
            )}
          </ul>
          
          {users.length > 5 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <button 
                onClick={() => router.push('/admin/users')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View all users
              </button>
            </div>
          )}
        </div>
        
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Alerts</h3>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {alerts.slice(0, 5).map((alert) => (
              <li key={alert.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center
                    ${alert.level === 'info' ? 'bg-blue-100 text-blue-500' : 
                      alert.level === 'warning' ? 'bg-yellow-100 text-yellow-500' : 'bg-red-100 text-red-500'}`}>
                    <i className={`${alert.level === 'info' ? 'ri-information-line' : 
                      alert.level === 'warning' ? 'ri-alert-line' : 'ri-alarm-warning-line'} text-lg`}></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    <div className="text-sm text-gray-500 truncate">{alert.message}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(alert.level)}`}>
                      {alert.level}
                    </span>
                  </div>
                </div>
              </li>
            ))}
            
            {alerts.length === 0 && (
              <li className="px-6 py-4 text-center text-gray-500">No alerts found</li>
            )}
          </ul>
          
          {alerts.length > 5 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <button 
                onClick={() => router.push('/admin/alerts')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View all alerts
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Fire Prediction Alerts</h3>
          <button 
            onClick={() => router.push('/admin/prediction-alerts')}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            <i className="ri-fire-line mr-2"></i>
            Generate Prediction Alerts
          </button>
        </div>
        
        <p className="text-gray-600">
          Create alerts automatically based on fire prediction data for today or future dates.
          The system will analyze high and medium risk areas and generate appropriate alerts.
        </p>
      </div>
    </AdminLayout>
  )
}

