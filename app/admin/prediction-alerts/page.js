"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/layout'
import api from '@/utils/api'

export default function PredictionAlertsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]) // Today's date
  
  const router = useRouter()
  
  const generateAlerts = async () => {
    setLoading(true)
    setResult(null)
    setError(null)
    
    try {
      const response = await api.post('/admin/generate-prediction-alerts', {
        date: selectedDate
      })
      
      setResult(response.data)
      
      // Show success for 3 seconds then redirect to alerts page
      setTimeout(() => {
        router.push('/admin/alerts')
      }, 3000)
    } catch (err) {
      console.error('Error generating alerts:', err)
      setError(err.response?.data?.detail || 'Failed to generate alerts')
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate date range (today and next 7 days)
  const getDateOptions = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 8; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dateString = date.toISOString().split('T')[0]
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
      
      dates.push({
        value: dateString,
        label: i === 0 ? `Today (${formattedDate})` : formattedDate
      })
    }
    
    return dates
  }
  
  return (
    <AdminLayout title="Generate Prediction Alerts">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Generate Alerts from Fire Predictions</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This tool automatically generates alerts based on fire prediction data for a specific date. 
              It will create alerts for areas with high and medium fire risk probabilities.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-information-line text-blue-400"></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-blue-700">
                    Alerts will be created for areas with:
                    <ul className="list-disc list-inside mt-1">
                      <li>High risk: Fire probability  0.99</li>
                      <li>Medium risk: Fire probability  0.94</li>
                    </ul>
                    The system avoids creating duplicate alerts for the same location within 24 hours.
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Prediction Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getDateOptions().map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-error-warning-line text-red-400"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-check-line text-green-400"></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-green-700">
                    {result.message}
                    <div className="mt-1 text-xs">Redirecting to alerts list...</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={generateAlerts}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="ri-alarm-warning-fill mr-1"></i> 
                  Generate Alerts
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
