"use client";
import { useEffect, useRef, useState } from 'react';
import { useMap } from '@/hooks/useMap';
import LoadingSpinner from './loading-spinner';

export default function ClientMapWrapper({
  mapId = 'map',
  mapType = 'prediction',
  date,
  riskFilters,
  dataSource,
  focusPoint,
  modelVersion,
  province,
  district
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { initMap, addPoints, clearPoints, isLoading, setLoading } = useMap();
  const [loadError, setLoadError] = useState(null);
  const prevDateRef = useRef(date);
  const prevMapTypeRef = useRef(mapType);

  useEffect(() => {
    let isMounted = true;
    const initializeMap = async () => {
      if (!mapRef.current) return;

      // Only initialize map if it hasn't been initialized yet
      if (!mapInstanceRef.current) {
        console.log(`Initializing ${mapType} map with ID: ${mapId}`);
        mapInstanceRef.current = await initMap(mapRef.current, mapId);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [initMap, mapId, mapType]);

  // Effect to fetch and display points when date, mapType, or filters change
  useEffect(() => {
    let isMounted = true;
    
    const fetchPoints = async () => {
      if (!mapInstanceRef.current) return;
      
      // Always clear previous points before fetching new ones
      clearPoints();
      
      // Only fetch data if we have a valid date
      if (!date) return;
      
      setLoading(true);
      setLoadError(null);
      
      try {
        console.log(`Fetching ${mapType} data for date: ${date}`);
        
        let endpoint = '';
        let queryParams = new URLSearchParams();
        
        // Set up the appropriate endpoint and params based on map type
        if (mapType === 'prediction') {
          // Use path structure /api/predictions/date/modelid 
          const modelId = modelVersion || 'xgb_v1.0'; // Default model if not specified
          endpoint = `/api/predictions/${date}/${modelId}`;
          
          // Only include high/medium risk points based on filters
          if (!riskFilters.high && !riskFilters.medium) {
            // If no risk levels are selected, don't fetch any data
            clearPoints();
            setLoading(false);
            return;
          }
          
          // Add risk filters as query params
          // if (riskFilters.high) queryParams.append('risk', 'high');
          // if (riskFilters.medium) queryParams.append('risk', 'medium');
          
          // Add location filters if available
          if (province) queryParams.append('province', province);
          if (district) queryParams.append('district', district);
        } else if (mapType === 'realtime') {
          if (dataSource === "BIPAD") {
            // Use the realtime API route for BIPAD data
            endpoint = `/api/realtime/${date}`;
          } else {
            // Use firms API for NASA FIRMS data
            endpoint = `/api/firms/${date}`;
            queryParams.append('source', dataSource);
          }
          
          // Add data source if available
          if (dataSource) queryParams.append('source', dataSource);
        }
        
        try {
          const fullUrl = queryParams.toString() 
            ? `${endpoint}?${queryParams.toString()}`
            : endpoint;
            
          console.log(`Making API request to: ${fullUrl}`);
          const response = await fetch(fullUrl);
          
          if (!response.ok) {
            console.warn(`API responded with status ${response.status} - treating as empty result`);
            // Don't throw error, just treat it as empty data
            if (!isMounted) return;
            clearPoints();
            return;
          }
          
          const data = await response.json();
          console.log(`Received data:`, data);
          
          if (!isMounted) return;
          
          // Clear existing points before adding new ones - this is critical!
          clearPoints();
          
          // Only try to add points if we have data
          if (data && data.length > 0) {
            console.log(`Adding ${data.length} points to ${mapType} map`);
            await addPoints(data, mapType);
          } else {
            console.log(`No ${mapType} data found for date: ${date}`);
            // Even though we already cleared points, let's make sure they're gone
            clearPoints();
          }
        } catch (error) {
          console.warn(`Error fetching data:`, error);
          // Just clear points, but don't show error to user in production
          clearPoints();
          if (process.env.NODE_ENV !== 'production' && isMounted) {
            setLoadError(`Failed to fetch ${mapType} data. Please try again.`);
          }
        }
      } catch (error) {
        console.error(`Error in fetch process:`, error);
        // Don't show error messages in production
        if (process.env.NODE_ENV !== 'production' && isMounted) {
          setLoadError(`Failed to process ${mapType} data. Please check console for details.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Store the current date and map type for comparison
    const dateChanged = prevDateRef.current !== date;
    const mapTypeChanged = prevMapTypeRef.current !== mapType;
    
    // Update refs with current values
    prevDateRef.current = date;
    prevMapTypeRef.current = mapType;
    
    // Fetch data if date, map type or relevant filters change
    fetchPoints();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [
    date, 
    mapType, 
    riskFilters, 
    dataSource, 
    modelVersion, 
    province, 
    district,
    addPoints,
    clearPoints,
    setLoading
  ]);

  // Effect to focus on a specific point if provided
  useEffect(() => {
    if (focusPoint && mapInstanceRef.current) {
      const { lat, lng } = focusPoint;
      console.log(`Focusing map on point: ${lat}, ${lng}`);
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  }, [focusPoint]);

  return (
    <div className="h-full w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <LoadingSpinner />
        </div>
      )}
      {loadError && process.env.NODE_ENV !== 'production' && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="text-red-500 text-center p-4 bg-white rounded-lg shadow-lg">
            <p className="font-semibold">{loadError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload
            </button>
          </div>
        </div>
      )}
      <div ref={mapRef} id={mapId} className="h-full w-full" />
    </div>
  );
}

