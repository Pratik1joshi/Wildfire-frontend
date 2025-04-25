import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { date, modelId } = params;
    
    console.log(`API request for model predictions: date=${date}, modelId=${modelId}`);
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD." },
        { status: 400 }
      );
    }
    
    // Find the requested model
    // ...existing code...
    
    // Generate predictions
    let predictions = [];
    
    try {
      // First try to use the Python FastAPI backend if available
      const backendUrl = process.env.BACKEND_URL || "https://livefire-api.onrender.com";
      const response = await fetch(`${backendUrl}/predictions/${date}/${modelId}`);
      
      if (response.ok) {
        predictions = await response.json();
        console.log(`Retrieved ${predictions.length} predictions from backend`);
      } else {
        console.error("Backend API error:", await response.text());
        // Fall back to mock data
        // ...existing mock data generation code...
      }
    } catch (backendError) {
      console.error("Failed to connect to backend, using mock data:", backendError);
      // Fall back to mock data generation
      // ...existing mock data generation code...
    }
    
    // Ensure we're returning an array
    if (!Array.isArray(predictions)) {
      console.error("Invalid prediction data format:", predictions);
      predictions = [];
    }
    
    console.log(`Responding with ${predictions.length} predictions`);
    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Unhandled error in predictions API:", error);
    // Always return an empty array in case of error
    return NextResponse.json([], { status: 500 });
  }
}