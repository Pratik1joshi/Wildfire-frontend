import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { uploadedFiles } from "../../upload/route";
import path from "path";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Find file record
    const fileIndex = uploadedFiles.findIndex(file => file.id === id);
    
    if (fileIndex === -1) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }
    
    const fileRecord = uploadedFiles[fileIndex];
    
    // Update file status
    fileRecord.status = "Processing";
    
    // Start processing in background
    processFile(fileRecord);
    
    return NextResponse.json({
      message: "Processing started",
      id: fileRecord.id
    });
    
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file", details: error.message },
      { status: 500 }
    );
  }
}

async function processFile(fileRecord) {
  try {
    // Path to Python script
    const scriptPath = path.join(process.cwd(), '..', 'backend', 'process_netcdf.py');
    
    // Run Python script to process the file
    const python = spawn('python', [scriptPath, fileRecord.path, fileRecord.id]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`Python stdout: ${data}`);
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`Python stderr: ${data}`);
    });
    
    python.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      
      if (code === 0) {
        // Success
        fileRecord.status = "Completed";
        fileRecord.results = {
          processed_at: new Date().toISOString(),
          message: stdout
        };
      } else {
        // Failed
        fileRecord.status = "Failed";
        fileRecord.error = stderr;
      }
    });
    
  } catch (error) {
    console.error(`Error in process file: ${error.message}`);
    fileRecord.status = "Failed";
    fileRecord.error = error.message;
  }
}
