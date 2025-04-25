import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const resolvedParams = await Promise.resolve(params);
    const { date } = resolvedParams;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }

    // Calculate yesterday's date for the BIPAD API range
    const selectedDate = new Date(date);
    const yesterday = new Date(selectedDate);
    yesterday.setDate(selectedDate.getDate() - 1);

    // Format dates for BIPAD API
    const fromDate = yesterday.toISOString().split("T")[0];
    const toDate = date;

    // Build the BIPAD API URL
    const bipadUrl = `https://bipadportal.gov.np/api/v1/incident/?rainBasin=&rainStation=&riverBasin=&riverStation=&hazard=12&inventoryItems=&incident_on__gt=${fromDate}T00%3A00%3A00%2B05%3A45&incident_on__lt=${toDate}T23%3A59%3A59%2B05%3A45&expand=loss%2Cevent%2Cwards&ordering=-incident_on&limit=-1&data_source=drr_api`;

    // Fetch data from BIPAD API
    const response = await fetch(bipadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch BIPAD data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Format the data for our frontend
    const formattedData = data.results.map(incident => ({
      ...incident,
      latitude: incident.point?.coordinates[1] || null,
      longitude: incident.point?.coordinates[0] || null,
      incident_date: incident.createdOn.split("T")[0],
      title: incident.title || incident.titleNe,
      description: incident.description || "No details available",
      loss: incident.loss || {},
      severity: incident.severity || "medium",
      source : incident.source,
    })).filter(item => item.latitude && item.longitude);

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching realtime data:", error);
    return NextResponse.json(
      { error: "Failed to fetch realtime data" },
      { status: 500 }
    );
  }
}
