import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Directory to store uploaded NetCDF files
var UPLOADS_DIR = path.join(process.cwd(), '..', 'backend', 'uploads');

// Ensure uploads directory exists
if (!existsSync(UPLOADS_DIR)) {
  try {
    mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`Created uploads directory: ${UPLOADS_DIR}`);
  } catch (error) {
    console.error(`Failed to create uploads directory: ${error.message}`);
    // Fallback to local directory
    UPLOADS_DIR = path.join(process.cwd(), 'uploads');
    if (!existsSync(UPLOADS_DIR)) {
      mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  }
}

// In-memory database for file tracking (replace with real DB in production)
export const uploadedFiles = [];

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const file = formData.get("file");
    const description = formData.get("description") || "";
    
    if (!file || !file.name) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Validate file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    if (fileExtension !== '.nc') {
      return NextResponse.json(
        { error: "Only NetCDF (.nc) files are allowed" },
        { status: 400 }
      );
    }
    
    // Generate unique ID and filename
    const id = uuidv4();
    const filename = `${id}${fileExtension}`;
    const filepath = path.join(UPLOADS_DIR, filename);
    
    // Get file buffer
    const buffer = await file.arrayBuffer();
    
    // Save the file
    await writeFile(filepath, Buffer.from(buffer));
    
    // Create file record
    const fileRecord = {
      id,
      original_filename: file.name,
      filename,
      description,
      path: filepath,
      upload_date: new Date().toISOString(),
      status: "Pending",
      results: null
    };
    
    // Store file record
    uploadedFiles.push(fileRecord);
    
    console.log(`File uploaded: ${filename}`);
    
    return NextResponse.json({
      id,
      filename: file.name,
      message: "File uploaded successfully"
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error.message },
      { status: 500 }
    );
  }
}
