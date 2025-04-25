"use client";
import { useEffect, useRef, useState } from "react";

export default function OverlayMap({
  predictionDate,
  realtimeDate,
  predictionFilters,
  realtimeFilters,
  dataSource,
  modelVersion
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletRef = useRef(null);
  const predictionLayerRef = useRef(null);
  const realtimeLayerRef = useRef(null);
  const predictionMarkersRef = useRef([]);
  const realtimeMarkersRef = useRef([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [predictionData, setPredictionData] = useState([]);
  const [realtimeData, setRealtimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        const L = await import('leaflet');
        leafletRef.current = L;

        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
          center: [28.3949, 84.124],
          zoom: 7,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        
        // Create layer groups for predictions and realtime data
        predictionLayerRef.current = L.layerGroup().addTo(map);
        realtimeLayerRef.current = L.layerGroup().addTo(map);
        
        mapInstanceRef.current = map;
        setIsMapReady(true);
      } catch (err) {
        setError("Map initialization failed: " + err.message);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch prediction data
  useEffect(() => {
    if (!isMapReady || !predictionDate || !modelVersion) return;
    
    const fetchPredictionData = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching overlay prediction data: ${predictionDate}, model: ${modelVersion}`);
        const response = await fetch(`/api/predictions/${predictionDate}/${modelVersion}`);
        
        if (!response.ok) throw new Error(`Failed to fetch prediction data: ${response.statusText}`);
        
        const data = await response.json();
        console.log(`Received ${Array.isArray(data) ? data.length : 0} prediction data points`);
        setPredictionData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching prediction data:", error);
        setPredictionData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPredictionData();
  }, [isMapReady, predictionDate, modelVersion]);

  // Fetch realtime data
  useEffect(() => {
    if (!isMapReady || !realtimeDate) return;
    
    const fetchRealtimeData = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching overlay realtime data: ${realtimeDate}, source: ${dataSource}`);
        
        // Use the correct endpoint based on the data source
        let endpoint = dataSource === "BIPAD" 
          ? `/api/realtime/${realtimeDate}` 
          : `/api/firms/${realtimeDate}`; // Changed from nasa-firms to firms
          
        console.log(`Using endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch realtime data: ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${Array.isArray(data) ? data.length : 0} realtime data points`);
        setRealtimeData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching realtime data:", error);
        setError(error.message);
        setRealtimeData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRealtimeData();
  }, [isMapReady, realtimeDate, dataSource]);

  // Update map with prediction markers - respond to both data and filter changes
  useEffect(() => {
    if (!isMapReady || !leafletRef.current || !predictionLayerRef.current) return;
    
    const L = leafletRef.current;
    const layer = predictionLayerRef.current;
    
    // Clear previous markers
    layer.clearLayers();
    predictionMarkersRef.current = [];
    
    // Skip if no data
    if (!Array.isArray(predictionData) || predictionData.length === 0) return;
    
    console.log(`Updating prediction markers with filters: high=${predictionFilters.high}, medium=${predictionFilters.medium}`);
    
    // Add new markers with applied filters
    predictionData.forEach((point) => {
      if (!point || !point.latitude || !point.longitude) return;
      
      // Apply risk filters
      const isHighRisk = point.fire_prob > 0.95;
      const isMediumRisk = point.fire_prob > 0.90 && point.fire_prob <= 0.95;
      
      // Skip if the risk level is filtered out
      if ((isHighRisk && !predictionFilters.high) || (isMediumRisk && !predictionFilters.medium)) {
        return;
      }
      
      // Determine color
      let color = "transparent";
      if (isHighRisk) {
        color = "red";
      } else if (isMediumRisk) {
        color = "orange";
      }
      
      // Create marker
      const popupContent = `
        <div class="map-popup">
          <div class="font-semibold">Fire Risk Prediction</div>
          <div>${point.GaPa_NaPa ? point.GaPa_NaPa + ', ' : ''}${point.DISTRICT || ''}</div>
          <div>Date: ${point.prediction_date}</div>
          <div>Risk: ${isHighRisk ? 'High' : 'Medium'}</div>
        </div>
      `;
      
      const marker = L.circleMarker([point.latitude, point.longitude], {
        radius: 5,
        color: color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 1,
      }).bindPopup(popupContent);
      
      marker.addTo(layer);
      predictionMarkersRef.current.push(marker);
    });
    
  }, [isMapReady, predictionData, predictionFilters]);

  // Update map with realtime markers
  useEffect(() => {
    if (!isMapReady || !leafletRef.current || !realtimeLayerRef.current) return;
    
    const L = leafletRef.current;
    const layer = realtimeLayerRef.current;
    
    // Clear previous markers
    layer.clearLayers();
    realtimeMarkersRef.current = [];
    
    // Skip if no data
    if (!Array.isArray(realtimeData) || realtimeData.length === 0) {
      console.log("No realtime data to display");
      return;
    }
    
    console.log(`Adding ${realtimeData.length} realtime markers for ${dataSource}`);
    
    // Add markers based on data source
    if (dataSource === "BIPAD") {
      // BIPAD markers
      realtimeData.forEach((incident) => {
        console.log("Adding BIPAD markers------------", incident);
        if (!incident || !incident.latitude || !incident.longitude) return;
        
        // Create popup content for BIPAD incidents
        const popupContent = `
          <div class="map-popup p-2">
            <div class="font-semibold text-red-600">${incident.title}</div>
            <div class="text-sm mt-1">Date: ${new Date(incident.incident_date).toLocaleDateString()}</div>
            <div class="text-sm">Location: ${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}</div>
            <div class="text-sm">Source: ${incident.source}</div>
            ${incident.description ? `<div class="text-sm mt-1">${incident.description}</div>` : ""}
          </div>
        `;
        
        // Create marker for BIPAD data
        const marker = L.circleMarker([incident.latitude, incident.longitude], {
          radius: 6,
          color: '#0000FF',
          fillColor: '#3333FF',
          fillOpacity: 0.5,
          weight: 2,
        }).bindPopup(popupContent);
        
        marker.addTo(layer);
        realtimeMarkersRef.current.push(marker);
      });
    } else {
      // NASA FIRMS markers
      realtimeData.forEach((incident) => {
        // Ensure we have latitude and longitude as numbers
        const lat = parseFloat(incident.latitude);
        const lng = parseFloat(incident.longitude);
        
        if (isNaN(lat) || isNaN(lng)) return;
        
        // Create popup content for NASA FIRMS
        const popupContent = `
          <div class="map-popup p-2">
            <div class="font-semibold text-red-600">NASA FIRMS Detection</div>
            <div class="text-sm mt-1">Date: ${incident.acq_date || new Date(incident.incident_date).toLocaleDateString()}</div>
            <div class="text-sm">Time: ${formatFirmsTime(incident.acq_time)}</div>
            <div class="text-sm">Confidence: ${incident.confidence || 'N/A'}</div>
            <div class="text-sm">Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
          </div>
        `;
        
        // Create marker with different styling for NASA data
        const marker = L.circleMarker([lat, lng], {
          radius: 5,
          color: '#0000FF',
          fillColor: '#3333FF',
          fillOpacity: 0.6,
          weight: 2,
        }).bindPopup(popupContent);
        
        marker.addTo(layer);
        realtimeMarkersRef.current.push(marker);
      });
    }
    
  }, [isMapReady, realtimeData, dataSource]);

  // Helper function for formatting FIRMS time
  const formatFirmsTime = (timeStr) => {
    if (!timeStr) return 'Unknown';
    // Convert "0130" format to "01:30"
    return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
  };

  // Debug when filters change
  useEffect(() => {
    if (isMapReady) {
      console.log("Overlay filters updated:", predictionFilters);
    }
  }, [isMapReady, predictionFilters]);

  useEffect(() => {
    // Log data source changes
    console.log(`OverlayMap data source changed to: ${dataSource}`);
    
    // Make sure any API calls use the dataSource parameter correctly
  }, [dataSource, realtimeDate]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden"></div>
      
      {isLoading && (
        <div className="absolute top-0 left-0 w-full flex justify-center">
          <div className="mt-2 bg-white bg-opacity-80 px-4 py-1 rounded-full text-sm font-medium shadow-md flex items-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading data...
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-0 left-0 w-full flex justify-center">
          <div className="mt-2 bg-red-50 text-red-600 px-4 py-1 rounded-full text-sm font-medium shadow-md">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
