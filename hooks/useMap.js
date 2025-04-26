"use client";
import { useCallback, useRef, useState, useEffect } from 'react';

export function useMap() {
  const [isLoading, setIsLoading] = useState(false);
  const markersRef = useRef({});
  const layerGroupsRef = useRef({});
  const leafletRef = useRef(null);

  // Load Leaflet on the client side only
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        leafletRef.current = L.default || L;
      }
    };
    loadLeaflet();
  }, []);

  const initMap = useCallback(async (container, id) => {
    // Make sure Leaflet is loaded
    if (!leafletRef.current) {
      const L = await import('leaflet');
      leafletRef.current = L.default || L;
    }
    
    const L = leafletRef.current;
    
    // Create a new map instance
    const map = L.map(container, {
      center: [28.3949, 84.124], // Center on Nepal
      zoom: 7,
      minZoom: 5,
      maxZoom: 18,
    });
    
    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    
    // Create a layer group for markers
    layerGroupsRef.current[id] = L.layerGroup().addTo(map);
    
    return map;
  }, []);

  const addPoints = useCallback(async (points, mapType) => {
    if (!points || !points.length) return;
    
    // Make sure Leaflet is loaded
    if (!leafletRef.current) {
      const L = await import('leaflet');
      leafletRef.current = L.default || L;
    }
    
    const L = leafletRef.current;
    const markers = [];
    
    console.log(`Adding ${points.length} points to ${mapType} map`);
    
    points.forEach((point, index) => {
      // Skip points without valid coordinates
      if (!point || !point.latitude || !point.longitude) return;
      
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Determine marker options based on map type and risk level
      let markerOptions = {};
      let popupContent = '';
      
      if (mapType === 'prediction') {
        // Fire risk prediction markers
        const isHighRisk = point.fire_prob > 0.99 && point.fire_prob <= 1.0;
        const isMediumRisk = point.fire_prob > 0.94 && point.fire_prob <= 0.95;
        
        let color = "transparent";
        if (isHighRisk) {
          color = "red";
        } else if (isMediumRisk) {
          color = "orange";
        }
        
        let riskLevel = "Normal";
        if (isHighRisk) {
          riskLevel = "High";
        } else if (isMediumRisk) {
          riskLevel = "Medium";
        }

        markerOptions = {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        };
        
        // Format date if available
        const date = point.prediction_date 
          ? new Date(point.prediction_date).toLocaleDateString()
          : 'N/A';
        
        // Build location string with fallbacks and handling different field name cases
        let location = '';
        
        // Handle both uppercase and lowercase field names
        const gapaName = point.gapa_napa || point.GaPa_NaPa;
        const districtName = point.district || point.DISTRICT;
        const provinceName = point.pr_name || point.PR_NAME;
        
        if (gapaName) location += `${gapaName}, `;
        if (districtName) location += `${districtName}, `;
        if (provinceName) location += provinceName;
        
        // Trim any trailing commas and spaces
        location = location.replace(/,\s*$/, "");
        if (!location) location = 'Location data unavailable';
        
        // Create popup content
        popupContent = `
          <div class="popup-content">
            <h3 class="text-lg font-bold">${riskLevel} Fire Risk</h3>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Date:</strong> ${date}</p>
            ${point.DISTRICT ? `<p><strong>District:</strong> ${point.DISTRICT}</p>` : ''}
          </div>
        `;
      } else {
        // Real-time fire markers
        markerOptions = {
          radius: 8,
          fillColor: '#3B82F6', // blue for real fires
          color: '#1E40AF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.6
        };
        
        const date = point.date 
          ? new Date(point.date).toLocaleDateString()
          : new Date().toLocaleDateString();
        
        // Create popup content for real fires
        popupContent = `
          <div class="popup-content">
            <h3 class="text-lg font-bold">${point.title}</h3>
            <p><strong>Date:</strong> ${point.incident_date}</p>
            <p><strong>Source:</strong> ${point.source || 'Unknown'}</p>
            <p><strong>Coordinates:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
          </div>
        `;
      }
      
      // Create the marker
      const marker = L.circleMarker([lat, lng], markerOptions)
        .bindPopup(popupContent);
      
      markers.push(marker);
    });
    
    // Add all markers to the map
    if (markers.length > 0) {
      // Get the first key in layerGroupsRef.current
      const mapId = Object.keys(layerGroupsRef.current)[0];
      if (mapId && layerGroupsRef.current[mapId]) {
        // Add markers to layer group
        markers.forEach(marker => marker.addTo(layerGroupsRef.current[mapId]));
      }
    }
    
    return markers;
  }, []);

  const clearPoints = useCallback(() => {
    // Clear all markers from all layer groups
    Object.values(layerGroupsRef.current).forEach(layerGroup => {
      if (layerGroup) layerGroup.clearLayers();
    });
  }, []);

  const centerOnPoint = useCallback(async (lat, lng, zoom = 13) => {
    // Make sure Leaflet is loaded
    if (!leafletRef.current) {
      const L = await import('leaflet');
      leafletRef.current = L.default || L;
    }
    
    const L = leafletRef.current;
    
    // Get all map instances
    Object.values(layerGroupsRef.current).forEach(layerGroup => {
      if (layerGroup && layerGroup._map) {
        layerGroup._map.setView([lat, lng], zoom);
        
        // Add a pulsing marker at the location
        const pulsingIcon = L.divIcon({
          className: 'pulsing-marker',
          html: '<div class="pulse"></div>',
          iconSize: [20, 20],
        });
        
        // Remove any existing focus marker
        if (markersRef.current.focusMarker) {
          layerGroup._map.removeLayer(markersRef.current.focusMarker);
        }
        
        // Add new focus marker
        markersRef.current.focusMarker = L.marker([lat, lng], { icon: pulsingIcon })
          .addTo(layerGroup._map);
          
        // Remove the marker after 5 seconds
        setTimeout(() => {
          if (markersRef.current.focusMarker) {
            layerGroup._map.removeLayer(markersRef.current.focusMarker);
            markersRef.current.focusMarker = null;
          }
        }, 5000);
      }
    });
  }, []);

  return {
    initMap,
    addPoints,
    clearPoints,
    centerOnPoint,
    isLoading,
    setLoading: setIsLoading,
  };
}
