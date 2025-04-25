"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/layout'
import api from '@/utils/api'

export default function UploadPredictionsPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [overwrite, setOverwrite] = useState(false)
  const [existingDates, setExistingDates] = useState([])
  
  const router = useRouter()
  
  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0])
      setError(null)
      setResult(null)
      setExistingDates([])
    }
  }
  
  const handleUpload = async (forceOverwrite = false) => {
    if (!selectedFile) {
      setError("Please select a CSV file to upload")
      return
    }
    
    setLoading(true)
    setResult(null)
    setError(null)
    
    // Create form data
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('overwrite', forceOverwrite || overwrite)
    
    try {
      const response = await api.post('/admin/upload-predictions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.status === 'conflict') {
        setExistingDates(response.data.existing_dates)
      } else {
        setResult(response.data)
        setSelectedFile(null)
      }
    } catch (err) {
      console.error('Error uploading file:', err)
      setError(err.response?.data?.detail || 'Failed to upload predictions')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AdminLayout title="Upload Predictions">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Upload Prediction CSV</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Upload a CSV file with prediction data to save to the database.
              The file should contain columns for latitude, longitude, prediction_date, valid_time,
              fire_prob, and prediction_class.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-information-line text-blue-400"></i>
                </div>
                <div className="ml-3">
                  <div className="text-sm text-blue-700">
                    For optimal results, ensure your CSV includes the following columns:
                    <ul className="list-disc list-inside mt-1">
                      <li>latitude, longitude - Coordinate points</li>
                      <li>prediction_date - Date in YYYY-MM-DD format</li>
                      <li>valid_time - Timestamp in ISO format</li>
                      <li>fire_prob - Fire probability (0.0-1.0)</li>
                      <li>prediction_class - Binary classification (0 or 1)</li>
                      <li>fire_category - (Optional) "high", "medium", "low", or "minimal"</li>
                      <li>district, gapa_napa, pr_name, province - (Optional) Location identifiers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="overwrite"
                name="overwrite"
                type="checkbox"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="overwrite" className="ml-2 block text-sm text-gray-900">
                Overwrite existing predictions for the same dates
              </label>
            </div>
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
          
          {existingDates.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex flex-col">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="ri-alert-line text-yellow-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      The following dates already have predictions in the database:
                    </p>
                  </div>
                </div>
                <div className="mt-2 ml-8">
                  <ul className="list-disc text-sm text-yellow-700">
                    {existingDates.map((date, index) => (
                      <li key={index}>{date}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <button
                      onClick={() => handleUpload(true)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded"
                    >
                      Overwrite Existing Data
                    </button>
                  </div>
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
                  <p className="text-sm text-green-700">
                    {result.message} <br/>
                    Processed {result.rows_processed} rows for {result.dates_processed.length} dates.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={() => handleUpload(false)}
              disabled={loading || !selectedFile}
              className={`px-4 py-2 rounded-md text-white ${
                loading || !selectedFile ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="ri-upload-cloud-line mr-1"></i> 
                  Upload Predictions
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
