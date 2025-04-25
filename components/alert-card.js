export default function AlertCard({ alert, onViewMap }) {
  const { type, title, updatedTime, location, period, details } = alert;
  
  // Determine border color based on risk level
  const borderColorClass = type === "high" 
    ? "border-red-500" 
    : "border-yellow-500";
  
  return (
    <div className={`bg-white p-5 rounded-lg shadow-md border-l-4 border-solid ${borderColorClass}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${type === "high" ? "bg-red-500" : "bg-yellow-500"} mr-2`}></div>
          <h3 className="font-medium text-gray-800">{title}</h3>
        </div>
        <span className="text-xs text-gray-500">{updatedTime}</span>
      </div>
      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">
          <i className="ri-map-pin-2-line mr-1"></i> {location}
        </div>
        <div className="text-xs text-gray-500">
          <i className="ri-calendar-line mr-1"></i> {period}
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-4">{details}</p>
      <div className="flex justify-between items-center">
        <button 
          onClick={onViewMap}
          className="text-primary hover:text-primary-dark text-sm font-medium flex items-center transition-all hover:scale-105"
        >
          <i className="ri-map-2-line mr-1"></i> View on map
        </button>
        <button className="text-primary hover:text-primary-dark text-sm font-medium flex items-center">
          <i className="ri-information-line mr-1"></i> Details
        </button>
      </div>
    </div>
  );
}

