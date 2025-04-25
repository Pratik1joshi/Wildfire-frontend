"use client"
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ClientMapWrapper from "./client-map-wrapper";

export default function ComparisonSection() {
  // State for the prediction date and real-time date
  const [predictionDate, setPredictionDate] = useState(new Date());
  const [realtimeDate, setRealtimeDate] = useState(new Date());
  
  // Format dates for API
  const formattedPredictionDate = predictionDate.toISOString().split('T')[0];
  const formattedRealtimeDate = realtimeDate.toISOString().split('T')[0];
  
  // Risk filter state (prediction map)
  const [riskFilters, setRiskFilters] = useState({
    high: true,
    medium: true
  });
  
  // Handle risk filter changes
  const handleRiskFilterChange = (riskLevel) => {
    setRiskFilters(prev => ({
      ...prev,
      [riskLevel]: !prev[riskLevel]
    }));
  };

  return (
    <section id="compare" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Compare Predictions with Real Fires</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Prediction Map */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Fire Risk Prediction</h3>
              <div className="relative z-50 w-full sm:w-auto">
                <DatePicker
                  selected={predictionDate}
                  onChange={(date) => setPredictionDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary"
                  wrapperClassName="w-full sm:w-auto"
                  calendarClassName="beautiful-calendar"
                  popperPlacement="auto"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: document.body,
                        padding: 20
                      }
                    },
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["bottom", "top", "right", "left"]
                      }
                    }
                  ]}
                />
              </div>
            </div>
            
            {/* Risk Filter Controls */}
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only"
                    checked={riskFilters.high}
                    onChange={() => handleRiskFilterChange('high')}
                  />
                  <div className={`w-10 h-5 rounded-full transition-all ${riskFilters.high ? 'bg-red-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${riskFilters.high ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">High Risk</span>
                </label>
              </div>
              <div className="flex items-center ml-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    className="sr-only"
                    checked={riskFilters.medium}
                    onChange={() => handleRiskFilterChange('medium')}
                  />
                  <div className={`w-10 h-5 rounded-full transition-all ${riskFilters.medium ? 'bg-orange-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${riskFilters.medium ? 'translate-x-5' : 'translate-x-1'}`}></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Medium Risk</span>
                </label>
              </div>
            </div>
            
            {/* Map Container */}
            <div className="h-[400px] w-full relative rounded-lg overflow-hidden">
              <ClientMapWrapper
                mapId="prediction-map"
                mapType="prediction"
                date={formattedPredictionDate}
                riskFilters={riskFilters}
              />
            </div>
          </div>
          
          {/* Realtime Fire Map */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">Actual Fire Incidents</h3>
              <div className="relative z-50 w-full sm:w-auto">
                <DatePicker
                  selected={realtimeDate}
                  onChange={(date) => setRealtimeDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary"
                  wrapperClassName="w-full sm:w-auto"
                  calendarClassName="beautiful-calendar"
                  popperPlacement="auto"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: document.body,
                        padding: 20
                      }
                    }
                  ]}
                />
              </div>
            </div>
            
            {/* Map Container */}
            <div className="h-[400px] w-full relative rounded-lg overflow-hidden">
              <ClientMapWrapper
                mapId="realtime-map"
                mapType="realtime"
                date={formattedRealtimeDate}
              />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600 max-w-3xl mx-auto">
            Compare our fire risk prediction model with actual fire incidents reported in Nepal. 
            This comparison helps evaluate the accuracy of our prediction system and identify areas for improvement.
          </p>
        </div>
      </div>
    </section>
  );
}
