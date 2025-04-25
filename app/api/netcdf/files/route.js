import { NextResponse } from "next/server";
import { uploadedFiles } from "../upload/route";

export async function GET() {
  try {
    return NextResponse.json(uploadedFiles);
  } catch (error) {
    console.error("Error getting files:", error);
    return NextResponse.json(
      { error: "Failed to get files", details: error.message },
      { status: 500 }
    );
  }
}
