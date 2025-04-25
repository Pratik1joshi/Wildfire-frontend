"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AdminSettings() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin()) {
      router.push("/")
    }
  }, [loading, isAdmin, router])

  // Show loading state or redirect if not authenticated
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAdmin()) {
    return null // Will redirect in the useEffect
  }

  return (
    <main>
      <Navbar />

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">System Settings</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === "general"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === "notifications"
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                Notifications
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === "api" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("api")}
              >
                API Settings
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                  activeTab === "users" ? "text-primary border-b-2 border-primary" : "text-gray-600 hover:text-gray-800"
                }`}
                onClick={() => setActiveTab("users")}
              >
                User Management
              </button>
            </div>

            <div className="p-6">
              {activeTab === "general" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">System Name</label>
                      <input
                        type="text"
                        defaultValue="FireGuard - Nepal Wildfire Prediction System"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="en">English</option>
                        <option value="ne">Nepali</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="Asia/Kathmandu">Asia/Kathmandu (GMT+5:45)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="enable-dark-mode"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="enable-dark-mode" className="ml-2 block text-sm text-gray-700">
                        Enable Dark Mode
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <input
                            id="email-high-risk"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="email-high-risk" className="ml-2 block text-sm text-gray-700">
                            Send email for high risk alerts
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="email-medium-risk"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="email-medium-risk" className="ml-2 block text-sm text-gray-700">
                            Send email for medium risk alerts
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="email-low-risk"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="email-low-risk" className="ml-2 block text-sm text-gray-700">
                            Send email for low risk alerts
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SMS Notifications</label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <input
                            id="sms-high-risk"
                            type="checkbox"
                            defaultChecked
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="sms-high-risk" className="ml-2 block text-sm text-gray-700">
                            Send SMS for high risk alerts
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="sms-medium-risk"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="sms-medium-risk" className="ml-2 block text-sm text-gray-700">
                            Send SMS for medium risk alerts
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notification Recipients</label>
                      <textarea
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter email addresses separated by commas"
                        defaultValue="forestdept@nepal.gov.np, emergency@nepal.gov.np"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "api" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">API Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value="fgrd_api_7a9c8b3d2e1f0"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                        />
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                          Regenerate
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Origins (CORS)</label>
                      <input
                        type="text"
                        defaultValue="https://nepal-forestry.gov.np, https://emergency-response.gov.np"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter domains separated by commas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limiting</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Requests per minute</label>
                          <input
                            type="number"
                            defaultValue="60"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Max requests per day</label>
                          <input
                            type="number"
                            defaultValue="10000"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">User Management</h2>

                  <div className="mb-6 flex justify-end">
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <i className="ri-user-add-line mr-1"></i> Add New User
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Role
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Admin User</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">admin@fireguard.np</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Admin
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary hover:text-blue-700 mr-3">Edit</button>
                          </td>
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Forest Department</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">forest@nepal.gov.np</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Manager
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary hover:text-blue-700 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-800">Deactivate</button>
                          </td>
                        </tr>

                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Emergency Response</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">emergency@nepal.gov.np</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Viewer
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary hover:text-blue-700 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-800">Deactivate</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-3">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

