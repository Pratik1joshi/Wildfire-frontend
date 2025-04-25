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
    
    if (fileRecord.status !== "Completed") {
      return NextResponse.json(
        { error: "Processing not completed yet", status: fileRecord.status },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      id: fileRecord.id,
      filename: fileRecord.original_filename,
      results: fileRecord.results
    });
    
  } catch (error) {
    console.error("Error getting results:", error);
    return NextResponse.json(
      { error: "Failed to get results", details: error.message },
      { status: 500 }
    );
  }
}
