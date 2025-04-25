"use client"
import { useEffect, useRef, useState, useCallback } from "react"

export default function MapDisplay({
    mapId,
    mapType = "prediction",
    date,
    onMapReady = () => {},
    focusPoint = null,
    riskFilters = { high: true, medium: true }, // Default to showing all risk levels
    modelVersion = "xgb_v1.0" // Default to the active model
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef([])
  const [isMapReady, setIsMapReady] = useState(false)
  const [mapData, setMapData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize map when component mounts
  const stableOnMapReady = useCallback(onMapReady, []);

  useEffect(() => {
    let isMounted = true;
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
        
        mapInstanceRef.current = map;
        setIsMapReady(true);
        stableOnMapReady(map);
      } catch (err) {
        if (isMounted) setError("Map initialization failed: " + err.message);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stableOnMapReady]);

  // Fetch data based on map type, date, and model version
  useEffect(() => {
    if (!isMapReady) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (mapType === "prediction") {
          console.log(`Fetching prediction data for date: ${date}, model: ${modelVersion}`);
          // Use model-specific endpoint
          const response = await fetch(`/api/predictions/${date}/${modelVersion}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Failed to fetch prediction data: ${response.statusText}${
                errorData.error ? ` - ${errorData.error}` : ""
              }`
            );
          }
          const data = await response.json();
          
          // Validate that data is an array
          if (!Array.isArray(data)) {
            console.error("Invalid prediction data format, expected array but got:", typeof data);
            setMapData([]);
            throw new Error("Invalid prediction data format returned from API");
          } else {
            console.log(`Received ${data.length} prediction data points from model ${modelVersion}`);
            setMapData(data);
          }
        } else if (mapType === "realtime") {
          console.log(`Fetching realtime data for date: ${date}`);
          const response = await fetch(`/api/realtime/${date}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Failed to fetch realtime data: ${response.statusText}${
                errorData.error ? ` - ${errorData.error}` : ""
              }`
            );
          }
          const data = await response.json();
          
          // Validate that data is an array
          if (!Array.isArray(data)) {
            console.error("Invalid realtime data format, expected array but got:", typeof data);
            setMapData([]);
            throw new Error("Invalid realtime data format returned from API");
          } else {
            console.log(`Received ${data.length} realtime incidents`);
            setMapData(data);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${mapType} map data:`, err);
        setError(err.message);
        setMapData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isMapReady, mapType, date, modelVersion]);

  // Update map markers when data changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    // Add defensive check to ensure mapData is an array
    if (!Array.isArray(mapData) || mapData.length === 0) {
      console.log("No valid map data to display");
      return;
    }

    // Log some sample data to debug
    if (mapData.length > 0) {
      console.log("Sample map point data:", mapData[0]);
    }

    // Create bounds for fitting map to markers
    const bounds = L.latLngBounds();

    // Add new markers based on map type
    if (mapType === "prediction") {
      mapData.forEach((point) => {
        if (!point.latitude || !point.longitude) return;

        // Apply risk filters
        const isHighRisk = point.fire_prob > 0.99 && point.fire_prob <= 0.998;
        const isMediumRisk = point.fire_prob > 0.94 && point.fire_prob <= 0.95;
        
        // Skip if the risk level is filtered out
        if ((isHighRisk && !riskFilters.high) || (isMediumRisk && !riskFilters.medium)) {
          return;
        }
        
        let color = "transparent";
        if (isHighRisk) {
          color = "red";
        } else if (isMediumRisk) {
          color = "orange";
        }

        // Get location information - check lowercase and uppercase field names
        // The API response might have different field formats
        const districtName = point.district || point.DISTRICT || null;
        const gapaName = point.gapa_napa || point.GaPa_NaPa || null;
        const provinceName = point.pr_name || point.PR_NAME || null;

        // Build location string with available information
        let locationString = "";
        if (gapaName) locationString += gapaName;
        if (districtName) {
          if (locationString) locationString += ", ";
          locationString += districtName;
        }
        if (provinceName) {
          if (locationString) locationString += ", ";
          locationString += provinceName;
        }
        
        // Use default text if no location data is available
        if (!locationString) locationString = "Location data unavailable";

        // Create popup content with the location string
        const popupContent = `
          <div class="map-popup">
            <div class="font-semibold">Fire Risk Prediction</div>
            <div>${locationString}</div>
            <div>Date: ${point.prediction_date.split('T')[0]}</div>
            <div>Risk Level: ${isHighRisk ? 'High' : 'Medium'}</div>
          </div>
        `;

        // Create marker
        const marker = L.circleMarker([point.latitude, point.longitude], {
          radius: 4,
          color: color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 1,
        }).bindPopup(popupContent);

        marker.addTo(map);
        markersRef.current.push(marker);
        bounds.extend([point.latitude, point.longitude]);
      });
    } else if (mapType === "realtime") {
      mapData.forEach((incident) => {
        if (!incident.latitude || !incident.longitude) return;

        // Create popup content for realtime fires
        const popupContent = `
          <div class="map-popup p-2">
            <div class="font-semibold text-red-600">${incident.title}</div>
            <div class="text-sm mt-1">Date: ${new Date(incident.incident_date).toLocaleDateString()}</div>
            <div class="text-sm">Location: ${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}</div>
            ${incident.description ? `<div class="text-sm mt-1">${incident.description}</div>` : ""}
          </div>
        `;

        // Create marker
        const marker = L.circleMarker([incident.latitude, incident.longitude], {
          radius: 6,
          color: "#FF0000",
          fillColor: "#FF0000",
          fillOpacity: 0.7,
          weight: 1,
        }).bindPopup(popupContent);

        marker.addTo(map);
        markersRef.current.push(marker);
        bounds.extend([incident.latitude, incident.longitude]);
      });
    }

    // Fit map to bounds if we have markers and no focus point
    if (markersRef.current.length > 0 && !focusPoint) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 10
      });
    }
  }, [isMapReady, mapData, mapType, riskFilters]);

  // Handle focus point (simplified)
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !leafletRef.current || !focusPoint) return;
    
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    
    // Simple highlight marker
    const highlightMarker = L.circleMarker([focusPoint.lat, focusPoint.lng], {
      radius: 8,
      color: '#FF4500',
      weight: 2,
      fillColor: '#FF4500',
      fillOpacity: 0.7,
    }).addTo(map);
    
    // Pan to point
    map.setView([focusPoint.lat, focusPoint.lng], 8);
    
    // Check if we need to open a popup for this location
    for (const marker of markersRef.current) {
      const latLng = marker.getLatLng();
      // Use approximate comparison for floating point coordinates
      if (Math.abs(latLng.lat - focusPoint.lat) < 0.001 && 
          Math.abs(latLng.lng - focusPoint.lng) < 0.001) {
        marker.openPopup();
        break;
      }
    }
    
    return () => {
      map.removeLayer(highlightMarker);
    };
  }, [isMapReady, focusPoint]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden"></div>

      {/* ...loading and error states... */}
    </div>
  );
}

