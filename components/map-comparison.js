"use client";
import { useState, useEffect, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ClientMapWrapper from "./client-map-wrapper";
import dynamic from 'next/dynamic';
import DateRangeAlert from "./date-range-alert";

// Import OverlayMap component dynamically to avoid SSR issues
const OverlayMap = dynamic(() => import('./overlay-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Loading map...</p>
      </div>
    </div>
  )
});

export default function MapComparison() {
  // Define date range constraints
  const minDate = new Date(2025, 3, 1); // April 1, 2025 (months are 0-indexed)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1); // Tomorrow
  
  // Initialize dates within the valid range
  const defaultDate = new Date(2025, 3, 1); // April 1, 2025
  const validDefaultDate = defaultDate > maxDate ? maxDate : defaultDate;

  // State for dates
  const [predictionDate, setPredictionDate] = useState(new Date());
  const [realtimeDate, setRealtimeDate] = useState(new Date());
  const [dataSource, setDataSource] = useState("BIPAD");
  const [modelVersion, setModelVersion] = useState("xgb_v1.0");
  const [isOverlayMode, setIsOverlayMode] = useState(false); // New state for overlay mode
  const [apiError, setApiError] = useState(null); // Add state for API errors

  // Define static models instead of fetching from API
  const availableModels = useMemo(() => [
    { id: "xgb_v1.0", name: "XGBoost v1.0", isActive: true },
  ], []);

  // State for risk filters
  const [predictionFilters, setPredictionFilters] = useState({
    high: true,
    medium: true,
  });

  const [realtimeFilters, setRealtimeFilters] = useState({
    high: true,
    medium: true,
  });

  // Format dates for API
  const formattedPredictionDate = predictionDate.toISOString().split("T")[0];
  const formattedRealtimeDate = realtimeDate.toISOString().split("T")[0];

  // Handle risk filter changes
  const handlePredictionFilterChange = (riskLevel) => {
    setPredictionFilters((prev) => ({
      ...prev,
      [riskLevel]: !prev[riskLevel],
    }));
  };

  const handleRealtimeFilterChange = (riskLevel) => {
    setRealtimeFilters((prev) => ({
      ...prev,
      [riskLevel]: !prev[riskLevel],
    }));
  };

  // Handle data source change
  const handleDataSourceChange = (e) => {
    const newSource = e.target.value;
    console.log(`Data source changed from ${dataSource} to ${newSource}`);
    setDataSource(newSource);
  };
  
  // Toggle overlay mode
  const toggleOverlayMode = () => {
    setIsOverlayMode(prev => !prev);
  };

  // Set the default active model on component mount
  useEffect(() => {
    // Find the active model from our static list
    const activeModel = availableModels.find(model => model.isActive);
    if (activeModel) {
      setModelVersion(activeModel.id);
      console.log(`Active model set to: ${activeModel.name} (${activeModel.id})`);
    }
  }, [availableModels]);

  return (
    <section id="compare" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Compare Predictions with Real Fires
        </h2>
        
        {/* Date Range Alert */}
        <DateRangeAlert className="mb-6 mx-auto" />
        
        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 mx-auto bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
            <strong className="font-bold">API Error:</strong>
            <span className="block sm:inline"> {apiError}</span>
            <p className="mt-1 text-sm">
              The API endpoint for real-time fire data might not be deployed or configured correctly.
            </p>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="mb-6 text-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg ${
                !isOverlayMode 
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOverlayMode(false)}
            >
              Side by Side
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg ${
                isOverlayMode 
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsOverlayMode(true)}
            >
              Overlay
            </button>
          </div>
        </div>
        
        {isOverlayMode ? (
          /* Overlay Mode - Single Map with Both Layers */
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
              {/* Prediction Date */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Prediction:
                  </label>
                  <DatePicker
                    selected={predictionDate}
                    onChange={(date) => setPredictionDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded text-sm w-32 focus:outline-none focus:border-primary"
                    wrapperClassName="w-full sm:w-auto"
                    calendarClassName="beautiful-calendar"
                    popperProps={{
                      strategy: "fixed"
                    }}
                  />
                </div>
              </div>
              
              {/* Real-time Date */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Real-time:
                  </label>
                  <DatePicker
                    selected={realtimeDate}
                    onChange={(date) => setRealtimeDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-1 px-2 rounded text-sm w-32 focus:outline-none focus:border-primary"
                    wrapperClassName="w-full sm:w-auto"
                    calendarClassName="beautiful-calendar"
                    popperProps={{
                      strategy: "fixed"
                    }}
                  />
                </div>
              </div>
              
              {/* Model Selector - Static models */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Model:
                  </label>
                  <select
                    className="appearance-none bg-gray-100 border-none text-gray-700 py-1 px-3 pr-8 rounded text-sm"
                    value={modelVersion}
                    onChange={(e) => setModelVersion(e.target.value)}
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}{model.isActive ? " (Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Data Source Selector */}
              <div className="w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Data Source:
                  </label>
                  <select
                    className="appearance-none bg-gray-100 border-none text-gray-700 py-1 px-3 pr-8 rounded text-sm"
                    value={dataSource}
                    onChange={handleDataSourceChange}
                  >
                    <option value="BIPAD">BIPAD (Nepal)</option>
                    <option value="NASA_FIRMS">NASA FIRMS</option>
                  </select>
                </div>
              </div>
              
              {/* Risk Filters - Only prediction filters in overlay mode */}
              <div className="w-full sm:w-auto flex flex-wrap gap-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-red-500 mr-2">Predictions:</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only"
                      checked={predictionFilters.high}
                      onChange={() => handlePredictionFilterChange("high")}
                    />
                    <div
                      className={`w-8 h-4 flex items-center rounded-full transition-all ${
                        predictionFilters.high ? "bg-red-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                          predictionFilters.high ? "translate-x-4" : "translate-x-1"
                        }`}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs font-medium text-gray-700">High</span>
                  </label>
                  <label className="inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={predictionFilters.medium}
                      onChange={() => handlePredictionFilterChange("medium")}
                    />
                    <div
                      className={`w-8 h-4 flex items-center rounded-full transition-all ${
                        predictionFilters.medium ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                          predictionFilters.medium ? "translate-x-4" : "translate-x-1"
                        }`}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs font-medium text-gray-700">Medium</span>
                  </label>
                </div>
                
                {/* Removed real-time filters */}
              </div>
            </div>
            
            {/* Overlay Map Container */}
            <div className="h-[500px] w-full relative rounded-lg overflow-hidden">
              <OverlayMap
                predictionDate={formattedPredictionDate}
                realtimeDate={formattedRealtimeDate}
                predictionFilters={predictionFilters}
                realtimeFilters={realtimeFilters}
                dataSource={dataSource}
                modelVersion={modelVersion} 
              />
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm">Prediction (High Risk)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
                <span className="text-sm">Prediction (Medium Risk)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-600 bg-blue-300 rounded-full mr-2"></div>
                <span className="text-sm">Real Fire Incidents</span>
              </div>
            </div>
          </div>
        ) : (
          /* Side-by-Side Mode (original layout) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Prediction Map */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
                  Fire Risk Prediction
                </h3>
                <div className="relative z-49 w-full sm:w-auto">
                  <DatePicker
                    selected={predictionDate}
                    onChange={(date) => setPredictionDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary"
                    wrapperClassName="w-full sm:w-auto"
                    calendarClassName="beautiful-calendar"
                    popperProps={{
                      strategy: "fixed"
                    }}
                  />
                </div>
              </div>

              {/* Model Selector - Static models */}
              <div className="mb-4">
                <div className="w-full flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Model:
                  </label>
                  <select
                    className="appearance-none bg-gray-100 border-none text-gray-700 py-2 px-4 pr-8 rounded flex-1"
                    value={modelVersion}
                    onChange={(e) => setModelVersion(e.target.value)}
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}{model.isActive ? " (Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Risk Filter Controls */}
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={predictionFilters.high}
                      onChange={() => handlePredictionFilterChange("high")}
                    />
                    <div
                      className={`w-10 h-5 flex items-center rounded-full transition-all ${
                        predictionFilters.high ? "bg-red-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          predictionFilters.high ? "translate-x-5" : "translate-x-1"
                        }`}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      High Risk
                    </span>
                  </label>
                </div>
                <div className="flex items-center justify-center ml-4">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={predictionFilters.medium}
                      onChange={() => handlePredictionFilterChange("medium")}
                    />
                    <div
                      className={`w-10 h-5 flex items-center rounded-full transition-all ${
                        predictionFilters.medium ? "bg-orange-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          predictionFilters.medium ? "translate-x-5" : "translate-x-1"
                        }`}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Medium Risk
                    </span>
                  </label>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-[400px] w-full relative rounded-lg overflow-hidden">
                <ClientMapWrapper
                  mapId="prediction-comparison-map"
                  mapType="prediction"
                  date={formattedPredictionDate}
                  riskFilters={predictionFilters}
                  modelVersion={modelVersion} // Pass the selected model
                />
              </div>
            </div>

            {/* Realtime Fire Map */}
            <div className="bg-white p-6 rounded-xl flex flex-col shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
                  Actual Fire Incidents
                </h3>
                <div className="relative z-49 w-full sm:w-auto">
                  <DatePicker
                    selected={realtimeDate}
                    onChange={(date) => setRealtimeDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary"
                    wrapperClassName="w-full sm:w-auto"
                    calendarClassName="beautiful-calendar"
                    popperProps={{
                      strategy: "fixed"
                    }}
                  />
                </div>
              </div>

              {/* Data Source selector */}
              <div className="mb-4">
                <div className="w-full flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Data Source:
                  </label>
                  <select
                    className="appearance-none bg-gray-100 border-none text-gray-700 py-2 px-4 pr-8 rounded flex-1"
                    value={dataSource}
                    onChange={handleDataSourceChange}
                  >
                    <option value="BIPAD">BIPAD (Nepal)</option>
                    <option value="NASA_FIRMS">NASA FIRMS</option>
                  </select>
                </div>
              </div>

              {/* Map Container */}
              <div className="h-[400px] w-full relative rounded-lg overflow-hidden">
                <ClientMapWrapper
                  mapId="realtime-comparison-map"
                  mapType="realtime"
                  date={formattedRealtimeDate}
                  riskFilters={realtimeFilters}
                  dataSource={dataSource}
                />
              </div>

              {/* Source information with enhanced info for NASA FIRMS */}
              <div className="mt-2 text-xs text-gray-500">
                {dataSource === "BIPAD" ? (
                  <p>
                    Source: BIPAD Portal - Nepal Government's Disaster Information
                    Management System
                  </p>
                ) : (
                  <div>
                    <p className="mb-1">
                      Source: NASA FIRMS (Fire Information for Resource Management System)
                    </p>
                    <p>
                      Showing data from {new Date(realtimeDate).toLocaleDateString()} (±1 day)
                    </p>
                  </div>
                )}
                
                {/* Add helpful message about API configuration */}
                <div className="mt-2 p-2 border border-amber-200 bg-amber-50 rounded">
                  <p>
                    <strong>Developer Note:</strong> API endpoint /api/fires must be properly 
                    configured to fetch real-time fire data. Check your API implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600 max-w-3xl mx-auto">
            Compare our fire risk prediction model with actual fire incidents
            reported by Nepal's BIPAD system and NASA's FIRMS satellite detection.
            This comparison helps evaluate the accuracy of our prediction system
            and identify areas for improvement.
          </p>
        </div>
      </div>
    </section>
  );
}