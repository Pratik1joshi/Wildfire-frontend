"use client"
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import "leaflet/dist/leaflet.css";
import ClientMapWrapper from "./client-map-wrapper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeAlert from "./date-range-alert";

export default function HeroSection({ 
  selectedDate, 
  riskFilters,
  onDateChange, 
  onRiskFilterChange,
  onModelChange // New prop for model change 
}) {
  const searchParams = useSearchParams();
  const [focusPoint, setFocusPoint] = useState(null);
  const [selectedModel, setSelectedModel] = useState("xgb_v1.0");
  
  // Define static models instead of fetching from API
  const availableModels = useMemo(() => [
    { id: "xgb_v1.0", name: "XGBoost v1.0", isActive: true },
    // { id: "rf_v1.0", name: "Random Forest v1.0", isActive: false },
    // { id: "nn_v1.0", name: "Neural Network v1.0", isActive: false }
  ], []);
  
  // Use hardcoded provinces and districts with useMemo like in fire-alerts.js
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");

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

  // Define date range constraints
  const minDate = new Date(2025, 3, 1); // April 1, 2025 (months are 0-indexed)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 1); // Tomorrow

  // Convert string date to Date object for DatePicker
  const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();

  // Update parent component when model changes
  const handleModelChange = (model) => {
    setSelectedModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
  };

  // Set the default active model on component mount
  useEffect(() => {
    // Find the active model from our static list
    const activeModel = availableModels.find(model => model.isActive);
    if (activeModel) {
      handleModelChange(activeModel.id);
      console.log(`Active model set to: ${activeModel.name} (${activeModel.id})`);
    }
  }, [availableModels]);

  // Extract coordinates from URL if present
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      setFocusPoint({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
    } else {
      setFocusPoint(null);
    }
  }, [searchParams]);

  // Handle date change
  const handleDateChange = (date) => {
    // Convert the Date object to ISO string and pass to parent
    const formattedDate = date.toISOString().split('T')[0];
    onDateChange(formattedDate);
  };

  // Handle province change
  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setSelectedProvince(province);
    setSelectedDistrict("all");
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  return (
    <section className="relative w-full h-[80vh]">
      {/* Alert Banner */}
      <div className="absolute top-0 left-0 right-0 z-49 px-4">
        <DateRangeAlert className="mt-4 max-w-3xl mx-auto" />
      </div>
    
      <div className="absolute inset-0 h-full z-0 w-full">
        <div className="h-full w-full">
          <ClientMapWrapper 
            mapId="hero-map" 
            mapType="prediction" 
            date={selectedDate}
            focusPoint={focusPoint}
            riskFilters={riskFilters}
            modelVersion={selectedModel}
            province={selectedProvince === "all" ? undefined : selectedProvince}
            district={selectedDistrict === "all" ? undefined : selectedDistrict}
          />
        </div>
      </div>
      
      {/* Control Panel - Left Side */}
      <div className="absolute top-20 left-4 z-49x bg-white rounded-lg shadow-lg p-4 max-w-[95%] sm:max-w-xs">
        {/* Date Picker */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">Prediction Date</div>
          <div className="relative z-49 w-full">
            <DatePicker
              selected={selectedDateObj}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              minDate={minDate}
              maxDate={maxDate}
              className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary"
              wrapperClassName="w-full"
              calendarClassName="beautiful-calendar"
              popperProps={{
                strategy: "fixed"
              }}
            />
          </div>
        </div>

        {/* Model Selector - Using static models */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">Model Version</div>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary appearance-none"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}{model.isActive ? " (Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Province Selector */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">Province</div>
          <div className="relative">
            <select
              value={selectedProvince}
              onChange={handleProvinceChange}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary"
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

        {/* District Selector */}
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">District</div>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              disabled={selectedProvince === "all"}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded w-full focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:text-gray-400"
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
      
      {/* Legend - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <div className="text-sm font-semibold mb-2">Risk Level</div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm">High Risk</span>
        </div>
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-sm">Medium Risk</span>
        </div>
      </div>
    </section>
  );
}

