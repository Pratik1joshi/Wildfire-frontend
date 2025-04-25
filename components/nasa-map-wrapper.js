// components/NasaFireMap.js
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function NasaFireMap({ date, mapId }) {
  const [fireIncidents, setFireIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  // Ensure component is ready in the browser
  useEffect(() => {
    setReady(true);
    return () => setReady(false);
  }, []);

  // Fetch fire data when the date changes
  useEffect(() => {
    if (!ready) return;

    const fetchFirmsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/firms/${date}`);
        if (!response.ok) {
          throw new Error("Failed to fetch fire data");
        }
        const data = await response.json();
        setFireIncidents(data);
      } catch (error) {
        console.error("Error fetching FIRMS data:", error);
        setError("Failed to load fire data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirmsData();
  }, [date, ready]);

  // Center the map on Nepal
  const nepalCenter = [28.3949, 84.1240];
  const zoomLevel = 7;

  // Loading state
  if (isLoading && !ready) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Loading fire data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Map not ready state
  if (!ready) {
    return <div className="h-full w-full bg-gray-100"></div>;
  }

  // Render the map with fire incidents
  return (
    <MapContainer
      id={mapId}
      center={nepalCenter}
      zoom={zoomLevel}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {fireIncidents.map((incident, index) => (
        <CircleMarker
          key={`fire-${index}`}
          center={[parseFloat(incident.latitude), parseFloat(incident.longitude)]}
          radius={5}
          color="#FF0000"
          fillColor="#FF0000"
          fillOpacity={0.8}
          weight={1}
        >
          <Popup>
            <div className="p-2">
              <div className="font-semibold text-red-600">Fire Detection</div>
              <div className="text-sm">Date: {incident.acq_date}</div>
              <div className="text-sm">
                Time:{" "}
                {incident.acq_time
                  ? `${incident.acq_time.substring(0, 2)}:${incident.acq_time.substring(2, 4)}`
                  : "Unknown"}
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}