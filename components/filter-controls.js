// "use client"
// import { useState } from "react"

// export default function FilterControls() {
//   const [selectedDate, setSelectedDate] = useState("2025-04-06")
//   const [displayDate, setDisplayDate] = useState("April 6th, 2025")
//   const [highRisk, setHighRisk] = useState(true)
//   const [mediumRisk, setMediumRisk] = useState(true)

//   const formatDate = (date) => {
//     const options = { year: "numeric", month: "long", day: "numeric" }
//     const formattedDate = new Date(date).toLocaleDateString("en-US", options)
//     // Add ordinal suffix to day
//     return formattedDate.replace(/(\d+)(?=,)/, (match) => {
//       const day = Number.parseInt(match)
//       const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : (day % 100) - (day % 10) != 10 ? day % 10 : 0]
//       return `${day}${suffix}`
//     })
//   }

//   const handleDateChange = (date) => {
//     setSelectedDate(date)
//     setDisplayDate(formatDate(date))
//   }

//   const handleDateButton = (offset) => {
//     const today = new Date()
//     const targetDate = new Date(today)
//     targetDate.setDate(today.getDate() + offset)

//     const year = targetDate.getFullYear()
//     const month = String(targetDate.getMonth() + 1).padStart(2, "0")
//     const day = String(targetDate.getDate()).padStart(2, "0")

//     const formattedDate = `${year}-${month}-${day}`
//     handleDateChange(formattedDate)
//   }

//   const handleReset = () => {
//     handleDateButton(0) // Reset to today
//     setHighRisk(true)
//     setMediumRisk(true)
//   }

//   return (
//     <section className="bg-white shadow-md py-6">
//       <div className="container mx-auto px-6">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Prediction Filters</h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//           <div>
//             <h3 className="text-lg font-medium text-gray-800 mb-3">Prediction Date</h3>
//             <div className="flex flex-col space-y-4">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   <i className="ri-calendar-line text-gray-500"></i>
//                 </div>
//                 <input
//                   type="text"
//                   className="bg-white border border-gray-200 text-gray-700 pl-10 pr-4 py-3 rounded-md w-full"
//                   value={displayDate}
//                   readOnly
//                   onClick={() => document.getElementById("date-picker").showPicker()}
//                 />
//                 <input
//                   id="date-picker"
//                   type="date"
//                   className="hidden"
//                   value={selectedDate}
//                   onChange={(e) => handleDateChange(e.target.value)}
//                 />
//               </div>

//               <div className="flex flex-wrap gap-3">
//                 <button
//                   onClick={() => handleDateButton(-1)}
//                   className="px-5 py-2 border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 rounded-md transition"
//                 >
//                   Yesterday
//                 </button>
//                 <button
//                   onClick={() => handleDateButton(0)}
//                   className="px-5 py-2 border border-orange-200 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-md transition"
//                 >
//                   Today
//                 </button>
//                 <button
//                   onClick={() => handleDateButton(1)}
//                   className="px-5 py-2 border border-gray-200 bg-white hover:bg-gray-100 text-gray-800 rounded-md transition"
//                 >
//                   Tomorrow
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="text-lg font-medium text-gray-800 mb-3">Risk Level Filter</h3>
//             <div className="flex flex-wrap gap-3">
//               <button
//                 onClick={() => setHighRisk(!highRisk)}
//                 className={`px-5 py-3 rounded-md transition flex-1 ${
//                   highRisk
//                     ? "bg-red-50 text-red-800 border border-red-200"
//                     : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
//                 }`}
//               >
//                 High Risk
//               </button>
//               <button
//                 onClick={() => setMediumRisk(!mediumRisk)}
//                 className={`px-5 py-3 rounded-md transition flex-1 ${
//                   mediumRisk
//                     ? "bg-orange-50 text-orange-800 border border-orange-200"
//                     : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
//                 }`}
//               >
//                 Medium Risk
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <button
//             onClick={handleReset}
//             className="bg-gray-200 text-gray-700 px-5 py-2 rounded-button whitespace-nowrap hover:bg-gray-300 transition"
//           >
//             Reset Filters
//           </button>
//         </div>
//       </div>
//     </section>
//   )
// }

