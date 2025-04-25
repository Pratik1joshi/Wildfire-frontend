"use client";
import { useState, useEffect, useMemo } from "react";
import AlertCard from "./alert-card";
import { useRouter } from "next/navigation";

export default function FireAlerts({ selectedDate, riskFilters, model }) {
  const router = useRouter();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [mapData, setMapData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Local risk filters (so we don't directly modify the parent state)
  const [localRiskFilters, setLocalRiskFilters] = useState(riskFilters);

  // Sync local risk filters with parent props when they change
  useEffect(() => {
    setLocalRiskFilters(riskFilters);
  }, [riskFilters]);

  // Memoize provinces
  const provinces = useMemo(
    () => [
      { id: "province1", name: "Koshi Province" },
      { id: "province2", name: "Madhesh Province" },
      { id: "province3", name: "Bagmati Province" },
      { id: "province4", name: "Gandaki Province" },
      { id: "province5", name: "Lumbini Province" },
      { id: "province6", name: "Karnali Province" },
      { id: "province7", name: "Sudurpashchim Province" },
    ],
    []
  );

  // Memoize districtsByProvince
  const districtsByProvince = useMemo(
    () => ({
      all: [{ id: "all", name: "All Districts" }],
      province1: [
        { id: "all", name: "All Districts" },
        { id: "taplejung", name: "Taplejung" },
        { id: "panchthar", name: "Panchthar" },
        { id: "ilam", name: "Ilam" },
        { id: "jhapa", name: "Jhapa" },
        { id: "morang", name: "Morang" },
        { id: "sunsari", name: "Sunsari" },
        { id: "dhankuta", name: "Dhankuta" },
        { id: "terhathum", name: "Terhathum" },
        { id: "sankhuwasabha", name: "Sankhuwasabha" },
        { id: "bhojpur", name: "Bhojpur" },
        { id: "solukhumbu", name: "Solukhumbu" },
        { id: "okhaldhunga", name: "Okhaldhunga" },
        { id: "khotang", name: "Khotang" },
        { id: "udayapur", name: "Udayapur" },
      ],
      province2: [
        { id: "all", name: "All Districts" },
        { id: "saptari", name: "Saptari" },
        { id: "siraha", name: "Siraha" },
        { id: "dhanusa", name: "Dhanusa" },
        { id: "mahottari", name: "Mahottari" },
        { id: "sarlahi", name: "Sarlahi" },
        { id: "rautahat", name: "Rautahat" },
        { id: "bara", name: "Bara" },
        { id: "parsa", name: "Parsa" },
      ],
      province3: [
        { id: "all", name: "All Districts" },
        { id: "dolakha", name: "Dolakha" },
        { id: "sindhupalchok", name: "Sindhupalchok" },
        { id: "rasuwa", name: "Rasuwa" },
        { id: "dhading", name: "Dhading" },
        { id: "nuwakot", name: "Nuwakot" },
        { id: "kathmandu", name: "Kathmandu" },
        { id: "bhaktapur", name: "Bhaktapur" },
        { id: "lalitpur", name: "Lalitpur" },
        { id: "kavrepalanchok", name: "Kavrepalanchok" },
        { id: "ramechhap", name: "Ramechhap" },
        { id: "sindhuli", name: "Sindhuli" },
        { id: "makwanpur", name: "Makwanpur" },
        { id: "chitwan", name: "Chitwan" },
      ],
      province4: [
        { id: "all", name: "All Districts" },
        { id: "gorkha", name: "Gorkha" },
        { id: "manang", name: "Manang" },
        { id: "mustang", name: "Mustang" },
        { id: "myagdi", name: "Myagdi" },
        { id: "kaski", name: "Kaski" },
        { id: "lamjung", name: "Lamjung" },
        { id: "tanahu", name: "Tanahu" },
        { id: "nawalparasi_east", name: "Nawalparasi East" },
        { id: "syangja", name: "Syangja" },
        { id: "parbat", name: "Parbat" },
        { id: "baglung", name: "Baglung" },
      ],
      province5: [
        { id: "all", name: "All Districts" },
        { id: "rukum_east", name: "Rukum East" },
        { id: "rolpa", name: "Rolpa" },
        { id: "pyuthan", name: "Pyuthan" },
        { id: "gulmi", name: "Gulmi" },
        { id: "arghakhanchi", name: "Arghakhanchi" },
        { id: "palpa", name: "Palpa" },
        { id: "nawalparasi_west", name: "Nawalparasi West" },
        { id: "rupandehi", name: "Rupandehi" },
        { id: "kapilvastu", name: "Kapilvastu" },
        { id: "dang", name: "Dang" },
        { id: "banke", name: "Banke" },
        { id: "bardiya", name: "Bardiya" },
      ],
      province6: [
        { id: "all", name: "All Districts" },
        { id: "dolpa", name: "Dolpa" },
        { id: "mugu", name: "Mugu" },
        { id: "humla", name: "Humla" },
        { id: "jumla", name: "Jumla" },
        { id: "kalikot", name: "Kalikot" },
        { id: "dailekh", name: "Dailekh" },
        { id: "jajarkot", name: "Jajarkot" },
        { id: "rukum_west", name: "Rukum West" },
        { id: "salyan", name: "Salyan" },
        { id: "surkhet", name: "Surkhet" },
      ],
      province7: [
        { id: "all", name: "All Districts" },
        { id: "bajura", name: "Bajura" },
        { id: "bajhang", name: "Bajhang" },
        { id: "darchula", name: "Darchula" },
        { id: "baitadi", name: "Baitadi" },
        { id: "dadeldhura", name: "Dadeldhura" },
        { id: "doti", name: "Doti" },
        { id: "achham", name: "Achham" },
        { id: "kailali", name: "Kailali" },
        { id: "kanchanpur", name: "Kanchanpur" },
      ],
    }),
    []
  );

  // Get districts based on selected province
  const districts =
    selectedProvince === "all"
      ? [{ id: "all", name: "All Districts" }]
      : districtsByProvince[selectedProvince] || [];

  // Handle province change
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict("all");
  };

  // Handle location search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Using Nominatim for geocoding (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )},Nepal`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result selection
  const handleSelectLocation = (result) => {
    // Navigate to this location on the map
    router.push(`/?lat=${result.lat}&lng=${result.lon}`);

    // Scroll to the hero section
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Clear search
    setSearchResults([]);
    setSearchQuery("");
  };

  // Handle risk filter changes
  const handleRiskFilterToggle = (riskLevel) => {
    setLocalRiskFilters((prev) => ({
      ...prev,
      [riskLevel]: !prev[riskLevel],
    }));
  };

  const handleDownloadReport = async () => {
    try {
      // Filter based on risk filters
      const filteredData = mapData.filter((item) => {
        const isHighRisk = item.fire_prob > 0.95;
        const isMediumRisk = item.fire_prob > 0.88 && item.fire_prob <= 0.95;
        return (
          (isHighRisk && riskFilters.high) ||
          (isMediumRisk && riskFilters.medium)
        );
      });

      // Convert to CSV
      const headers = [
        "District",
        "Location",
        "Risk Level",
        "Date",
        "Latitude",
        "Longitude",
        "Province",
      ];
      const csvRows = [
        headers.join(","),
        ...filteredData.map((item) => {
          const riskLevel = item.fire_prob > 0.95 ? "High" : "Medium";
          const district = item.district || item.DISTRICT || "Unknown";
          const location = item.gapa_napa || item.GaPa_NaPa || "Unknown";
          const province = item.pr_name || item.PR_NAME || "Unknown";
          
          return [
            district,
            location,
            riskLevel,
            item.prediction_date,
            item.latitude,
            item.longitude,
            province,
          ].join(",");
        }),
      ];

      // Create and download the CSV file
      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `fire-risk-report-${selectedDate}-${model}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  // Fetch alerts based on selected date and filters
  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/predictions/${selectedDate}/${model}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch prediction data: ${response.statusText}`);
        }
        
        const predictionData = await response.json();
        
        // Validate that predictionData is an array
        if (!Array.isArray(predictionData)) {
          console.error("Invalid prediction data format:", predictionData);
          setMapData([]);
          setAlerts([]);
          throw new Error("Invalid prediction data format returned from API");
        }
        
        // Log the first point to check structure
        if (predictionData.length > 0) {
          console.log("Debug - API returned data:", predictionData[0]);
        }
        
        setMapData(predictionData);

        // Group prediction points by location and coordinates for uniqueness
        const locationGroups = {};

        // First pass: organize points by unique location
        predictionData
          .filter((point) => point && typeof point === 'object' && point.fire_prob > 0.88)
          .forEach((point) => {
            // Create a more unique key using coordinates with sufficient precision
            const locationKey = `${point.latitude.toFixed(5)}_${point.longitude.toFixed(5)}`;

            // If we haven't seen this location yet, or if this point has a higher risk
            // than what we've already stored, update the location group
            if (
              !locationGroups[locationKey] ||
              (point.fire_prob > locationGroups[locationKey].fire_prob)
            ) {
              locationGroups[locationKey] = point;
            }
          });

        console.log("Debug - number of unique locations:", Object.keys(locationGroups).length);

        // Convert groups to alerts
        const newAlerts = Object.values(locationGroups).map((point, index) => {
          const isHighRisk = point.fire_prob > 0.99;
          
          // Extract location data with fallbacks, handle all possible field name variations
          const districtName = point.district || point.DISTRICT;
          const provinceName = point.pr_name || point.PR_NAME;
          const gapaNapa = point.gapa_napa || point.GaPa_NaPa;
          const provinceNumber = point.province || point.PROVINCE;

          console.log("Location data for point:", {
            districtName,
            provinceName,
            gapaNapa,
            provinceNumber,
            rawPoint: point
          });
          
          // Build location name from available parts
          let locationName = "";
          if (gapaNapa) {
            locationName += `${gapaNapa}, `;
          }
          if (districtName) {
            locationName += `${districtName}, `;
          }
          if (provinceName) {
            locationName += provinceName;
          } else {
            locationName += "Nepal";
          }
          
          // Trim any trailing commas and spaces
          locationName = locationName.replace(/,\s*$/, "");
          if (locationName === "") locationName = "Unknown location";

          const startDate = new Date(selectedDate);

          const period = `${startDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          })}`;

          const now = new Date(); // current time
          
          // Get the prediction date
          const predictionDate = new Date(point.prediction_date || selectedDate);
          
          // Set the update time to be the day before at 5:45 AM
          const updateTime = new Date(predictionDate);
          updateTime.setDate(updateTime.getDate() - 1); // go back one day
          updateTime.setHours(5, 45, 0, 0); // set to 5:45 AM
          
          // Calculate time difference from now to the update time
          const diffMs = now - updateTime;
          const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
          
          let updatedTime;
          if (diffHrs >= 24) {
            const diffDays = Math.floor(diffHrs / 24);
            updatedTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          } else if (diffHrs > 0) {
            updatedTime = `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
          } else {
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            updatedTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
          }

          const fireProb = point.fire_prob * 100;
          const details = isHighRisk
            ? `High temperature and low humidity conditions combined with dry vegetation create extreme fire risk in this area (${fireProb.toFixed(
                1
              )}% probability). Immediate preventive measures recommended.`
            : `Moderate fire risk due to seasonal dry conditions. Monitoring advised with potential for escalation if weather patterns change.`;

          return {
            id: index + 1,
            type: isHighRisk ? "high" : "medium",
            title: isHighRisk ? "High Risk Alert" : "Medium Risk Alert",
            updatedTime,
            location: locationName,
            period,
            details,
            coordinates: {
              lat: point.latitude,
              lng: point.longitude,
            },
          };
        });

        setAlerts(newAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
        setAlerts([]);
        setMapData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [selectedDate, model]);

  // Filter alerts based on user selections and LOCAL risk filters
  let filteredAlerts = [...alerts];

  // Apply risk level filters from local state
  if (!localRiskFilters.high) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.type !== "high");
  }
  if (!localRiskFilters.medium) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.type !== "medium");
  }

  // Apply location filters
  if (selectedProvince !== "all") {
    filteredAlerts = filteredAlerts.filter(
      (alert) => alert.province === selectedProvince
    );

    if (selectedDistrict !== "all") {
      filteredAlerts = filteredAlerts.filter(
        (alert) => alert.district === selectedDistrict
      );
    }
  }

  // Apply search text filter if there's a query
  if (searchQuery.trim()) {
    filteredAlerts = filteredAlerts.filter((alert) =>
      alert.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort filtered alerts
  if (sortBy === "latest") {
    // Already sorted by time in the data
  } else if (sortBy === "risk") {
    filteredAlerts.sort((a, b) => (a.type === "high" ? -1 : 1));
  } else if (sortBy === "location") {
    filteredAlerts.sort((a, b) => a.location.localeCompare(b.location));
  }

  // Function to handle "View on Map" action - fix potential undefined function issue
  const handleViewOnMap = (coordinates) => {
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      console.error("Invalid coordinates", coordinates);
      return; // Exit early if coordinates are invalid
    }
    
    // Use the router to navigate to home with coordinates as query parameters
    router.push(`/?lat=${coordinates.lat}&lng=${coordinates.lng}`);

    // Safe scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="alerts" className="py-12 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
            Fire Alerts
          </h2>
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Auto-refresh</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={() => setAutoRefresh(!autoRefresh)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="relative w-full md:w-auto">
              <select
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-primary w-full"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Sort by: Latest</option>
                <option value="risk">Sort by: Risk Level</option>
                <option value="location">Sort by: Location</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Search */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Search</h3>
              <form onSubmit={handleSearch} className="relative">
                <div className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search location..."
                    className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-l w-full focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white py-2 px-3 rounded-r hover:bg-primary-dark focus:outline-none"
                    disabled={isSearching}
                  >
                    {isSearching ? "..." : <i className="ri-search-line"></i>}
                  </button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                        onClick={() => handleSelectLocation(result)}
                      >
                        <div className="font-medium">
                          {result.display_name.split(",")[0]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.display_name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Risk Level Filters */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Risk Level
              </h3>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={localRiskFilters.high}
                    onChange={() => handleRiskFilterToggle("high")}
                  />
                  <div
                    className={`w-10 h-5 flex items-center rounded-full transition-all ${
                      localRiskFilters.high ? "bg-red-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        localRiskFilters.high
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    High Risk
                  </span>
                </label>
                <label className="inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={localRiskFilters.medium}
                    onChange={() => handleRiskFilterToggle("medium")}
                  />
                  <div
                    className={`w-10 h-5 flex items-center rounded-full transition-all ${
                      localRiskFilters.medium ? "bg-yellow-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        localRiskFilters.medium
                          ? "translate-x-5"
                          : "translate-x-1"
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Medium Risk
                  </span>
                </label>
              </div>
            </div>

            {/* Location Filter */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Location
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="relative">
                    <select
                      className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded w-full focus:outline-none focus:border-primary"
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                    >
                      <option value="all">All Provinces</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <i className="ri-arrow-down-s-line"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <select
                      className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded w-full focus:outline-none focus:border-primary"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={selectedProvince === "all"}
                    >
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <i className="ri-arrow-down-s-line"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-700">Loading alerts...</span>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="flex flex-col gap-8 justify-center">
            <div className="max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onViewMap={() => handleViewOnMap(alert.coordinates)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleDownloadReport}
                className="bg-blue-500 hover:bg-blue-600 text-white py-3 cursor-pointer px-6 rounded flex items-center justify-center transition-colors"
              >
                <i className="ri-download-line mr-2"></i> Download Report
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <i className="ri-search-line ri-3x text-gray-400 mb-3"></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Alerts Found
            </h3>
            <p className="text-gray-600">
              There are no fire alerts matching your current filter criteria.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
