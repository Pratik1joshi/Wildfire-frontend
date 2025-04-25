"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ModelManagement from "@/components/model-management"

export default function AdminModelsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/")
    }
  }, [loading, isAdmin, router])

  // Show loading state or redirect if not authenticated
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAdmin) {
    return null // Will redirect in the useEffect
  }

  return (
    <main>
      <Navbar />

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Model Management</h1>
          <p className="text-gray-600 mb-8">
            Upload, manage, and activate different prediction models. Newly uploaded models will be saved to the backend model directory.
          </p>

          <ModelManagement />
        </div>
      </div>

      <Footer />
    </main>
  )
}
