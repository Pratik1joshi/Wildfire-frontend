// export async function GET(request) {
//   try {
//     const url = new URL(request.url);
//     const date = url.searchParams.get("date");

//     if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
//       return Response.json(
//         { error: "Invalid date format. Use YYYY-MM-DD." },
//         { status: 400 }
//       );
//     }

//     // Mock real-time data
//     return Response.json([
//       {
//         latitude: 27.7,
//         longitude: 85.3,
//         incident_date: date,
//         title: "Forest Fire",
//         description: "A forest fire was reported in Kathmandu.",
//       },
//       {
//         latitude: 28.2,
//         longitude: 84.0,
//         incident_date: date,
//         title: "Wildfire",
//         description: "A wildfire occurred in Kaski district.",
//       },
//     ]);
//   } catch (error) {
//     console.error("Error in real-time API route:", error);
//     return Response.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     );
//   }
// }
