"use client";
import { useEffect, useRef, useState } from "react";
import { useMap } from "../hooks/useMap";

export default function ClientMapWrapper({
  mapId,
  mapType = "prediction", // 'prediction' or 'realtime'
  date,
  riskFilters = { high: true, medium: true },
  focusPoint = null,
  modelVersion = "xgb_v1.0",
  dataSource = "BIPAD",
  province = undefined,
  district = undefined
}) {
  const containerRef = useRef(null);
  const mapInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointsData, setPointsData] = useState([]);

  const { initMap, addPoints, clearPoints, centerOnPoint, setLoading } = useMap();

  // Debug logging for filters
  useEffect(() => {
    if (province || district) {
      console.log(`Filters applied - Province: ${province}, District: ${district}`);
    }
  }, [province, district]);

  // Log changes in data source
  useEffect(() => {
    if (mapType === "realtime") {
      console.log(`Map ${mapId} data source changed to: ${dataSource}`);
    }
  }, [dataSource, mapId, mapType]);

  // Initialize the map
  useEffect(() => {
    if (containerRef.current && !mapInstance.current) {
      const map = initMap(containerRef.current, mapId);
      mapInstance.current = map;
      setIsLoading(false);
    }
  }, [mapId, initMap]);

  // Handle data fetching
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        let endpoint;
        
        // Determine the API endpoint based on map type
        if (mapType === "prediction") {
          endpoint = `/api/predictions/${date}/${modelVersion}`;
          console.log(`Fetching prediction data for date: ${date}, model: ${modelVersion}`);
        } else if (mapType === "realtime") {
          // Make sure to properly encode the dataSource parameter
          const source = encodeURIComponent(dataSource);
          // Fix the NASA_FIRMS vs FIRMS source name issue
          if (source === "BIPAD") {
            endpoint = `/api/realtime/${date}`;
          } else {
            // Handle both "NASA_FIRMS" and "FIRMS" as valid values
            endpoint = `/api/firms/${date}`;
          }
          console.log(`Fetching realtime data for date: ${date}, source: ${dataSource}`);
        } else {  
          throw new Error(`Invalid map type: ${mapType}`);
        }
        
        console.log(`API endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} data points for ${mapType} map with source: ${mapType === 'realtime' ? dataSource : modelVersion}`);
        
        // Store raw data
        setPointsData(data);
        
      } catch (error) {
        console.error(`Error fetching ${mapType} data:`, error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (mapInstance.current && date) {
      fetchData();
    }
    
  }, [mapType, date, modelVersion, dataSource, setLoading]);

  // Filter and render points when data or filters change
  useEffect(() => {
    if (!mapInstance.current || !pointsData.length) {
      return;
    }
    
    // Clear existing points
    clearPoints();
    
    // Filter the data based on risk level, province and district
    const filteredData = pointsData.filter(point => {
      // Skip invalid points
      if (!point || typeof point !== 'object' || !point.latitude || !point.longitude) {
        return false;
      }
      
      // Apply risk filters for prediction data
      if (mapType === "prediction") {
        const isHighRisk = point.fire_prob > 0.95;
        const isMediumRisk = point.fire_prob > 0.88 && point.fire_prob <= 0.95;
        
        if ((isHighRisk && !riskFilters.high) || (isMediumRisk && !riskFilters.medium)) {
          return false;
        }
      }
      
      // Apply province filter if provided
      if (province && province !== "all" && province !== undefined) {
        // Convert province1 to 1 for comparison
        const provinceNumber = province.replace("province", "");
        
        // Fix: Safely compare province values
        // If point doesn't have PROVINCE data, exclude it when filtering by province
        if (!point.PROVINCE) {
          return false;
        }
        
        // Convert both to strings and compare
        const pointProvince = String(point.PROVINCE);
        const filterProvince = String(provinceNumber);
        
        if (pointProvince !== filterProvince) {
          return false;
        }
      }
      
      // Apply district filter if provided
      if (district && district !== "all" && district !== undefined) {
        // If point doesn't have DISTRICT data, exclude it when filtering by district
        if (!point.DISTRICT) {
          return false;
        }
        
        // Convert both to lowercase for case-insensitive comparison
        const pointDistrict = String(point.DISTRICT).toLowerCase();
        const selectedDistrict = district.toLowerCase();
        
        // Check if the point's district contains the selected district name
        if (!pointDistrict.includes(selectedDistrict)) {
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`Filtered to ${filteredData.length} points based on filters`);
    
    // Add filtered points to the map
    addPoints(filteredData, mapType);
    
  }, [pointsData, riskFilters, mapType, addPoints, clearPoints, province, district]);

  // Focus on a specific point if provided
  useEffect(() => {
    if (mapInstance.current && focusPoint) {
      centerOnPoint(focusPoint.lat, focusPoint.lng, 13);
    }
  }, [focusPoint, centerOnPoint]);

  return (
    <div className="h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-60">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-700">Loading map data{mapType === 'realtime' ? ` from ${dataSource}` : ''}...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-60">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      )}
      
      <div ref={containerRef} className="h-full w-full"></div>
    </div>
  );
}

