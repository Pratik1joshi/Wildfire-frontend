"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import adminApi from '@/services/admin-api'
import AdminLayout from '@/components/admin/layout'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentAlert, setCurrentAlert] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    level: 'info', // Default: info, warning, danger
    location: '',
    latitude: '',
    longitude: '',
  })

  // Add filter state
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

    fetchAlerts()
  }, [isAuthenticated, isAdmin, router])

  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const data = await adminApi.getAlerts()
      setAlerts(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError('Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleAddAlert = async (e) => {
    e.preventDefault()

    // Convert latitude and longitude to numbers if provided
    const alertData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null
    }

    try {
      await adminApi.createAlert(alertData)
      setShowAddModal(false)
      setFormData({
        title: '',
        message: '',
        level: 'info',
        location: '',
        latitude: '',
        longitude: '',
      })
      fetchAlerts()
    } catch (err) {
      console.error('Error creating alert:', err)
      setError('Failed to create alert')
    }
  }

  const handleEditAlert = async (e) => {
    e.preventDefault()

    // Convert latitude and longitude to numbers if provided
    const alertData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null
    }

    try {
      await adminApi.updateAlert(currentAlert.id, alertData)
      setShowEditModal(false)
      setCurrentAlert(null)
      fetchAlerts()
    } catch (err) {
      console.error('Error updating alert:', err)
      setError('Failed to update alert')
    }
  }

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return
    }

    try {
      await adminApi.deleteAlert(alertId)
      fetchAlerts()
    } catch (err) {
      console.error('Error deleting alert:', err)
      setError('Failed to delete alert')
    }
  }

  const openEditModal = (alert) => {
    setCurrentAlert(alert)
    setFormData({
      title: alert.title,
      message: alert.message,
      level: alert.level,
      location: alert.location || '',
      latitude: alert.latitude ? String(alert.latitude) : '',
      longitude: alert.longitude ? String(alert.longitude) : '',
    })
    setShowEditModal(true)
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

  // Add filtering logic
  const filteredAlerts = alerts
    .filter(alert => filterLevel === 'all' || alert.level === filterLevel)
    .filter(alert => 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (alert.location && alert.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <AdminLayout title="Alert Management">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Alert Management</h1>
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg"
          onClick={() => setShowAddModal(true)}
        >
          <i className="ri-add-line mr-1"></i> Create New Alert
        </button>
      </div>

      {/* Add filter UI above the table */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by level:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterLevel('all')}
                className={`px-3 py-1 text-sm rounded ${
                  filterLevel === 'all' 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterLevel('info')}
                className={`px-3 py-1 text-sm rounded ${
                  filterLevel === 'info' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Info
              </button>
              <button
                onClick={() => setFilterLevel('warning')}
                className={`px-3 py-1 text-sm rounded ${
                  filterLevel === 'warning' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Warning
              </button>
              <button
                onClick={() => setFilterLevel('danger')}
                className={`px-3 py-1 text-sm rounded ${
                  filterLevel === 'danger' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Danger
              </button>
            </div>
          </div>
          
          <div className="flex-1 md:max-w-xs">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </div>
          
          <button 
            onClick={() => router.push('/admin/prediction-alerts')}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            <i className="ri-fire-line mr-1"></i>
            Generate Prediction Alerts
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{alert.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelBadgeClass(alert.level)}`}>
                      {alert.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {alert.location || 'N/A'}
                      {alert.latitude && alert.longitude && (
                        <div className="text-xs text-gray-400">
                          {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => openEditModal(alert)}
                    >
                      <i className="ri-edit-line mr-1"></i> Edit
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <i className="ri-delete-bin-line mr-1"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No alerts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Alert</h3>
            
            <form onSubmit={handleAddAlert}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 27.7172"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 85.3240"
                  />
                </div>
              </div>
              
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Alert Modal */}
      {showEditModal && currentAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Alert</h3>
            
            <form onSubmit={handleEditAlert}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="danger">Danger</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 27.7172"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 85.3240"
                  />
                </div>
              </div>
              
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Update Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

