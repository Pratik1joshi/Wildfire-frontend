"use client"
import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import FireAlerts from "@/components/fire-alerts"
import MapComparison from "@/components/map-comparison"
import Footer from "@/components/footer"
import SmoothScroll from "@/components/smooth-scroll"

export default function Home() {
  // Shared state for date, model, and risk filter
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedModel, setSelectedModel] = useState("xgb_v1.0")
  const [riskFilters, setRiskFilters] = useState({ high: true, medium: true })

  // Handler functions
  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleRiskFilterChange = (filters) => {
    setRiskFilters(filters)
  }

  const handleModelChange = (model) => {
    setSelectedModel(model)
  }

  return (
    <main>
      <Navbar />
      <SmoothScroll />
      
      {/* Pass down date, model, and risk filter state & handlers */}
      <Suspense fallback={<div>Loading...</div>}>
      <Suspense fallback={<div>Loading search functionality...</div>}>
        

      <HeroSection 
        selectedDate={selectedDate} 
        riskFilters={riskFilters}
        onDateChange={handleDateChange}
        onRiskFilterChange={handleRiskFilterChange}
        onModelChange={handleModelChange}
        />
      
      <MapComparison />
      {/* Pass the shared state*/}
      <FireAlerts 
        selectedDate={selectedDate} 
        riskFilters={riskFilters} 
        model={selectedModel}
        />
      </Suspense>
      </Suspense>
      <Footer />
    </main>
  )
}

// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
