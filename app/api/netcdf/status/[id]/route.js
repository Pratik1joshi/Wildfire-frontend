import { NextResponse } from "next/server";
import { uploadedFiles } from "../../upload/route";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Find file record
    const fileRecord = uploadedFiles.find(file => file.id === id);
    
    if (!fileRecord) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(fileRecord);
    
  } catch (error) {
    console.error("Error getting file status:", error);
    return NextResponse.json(
      { error: "Failed to get file status", details: error.message },
      { status: 500 }
    );
  }
}
