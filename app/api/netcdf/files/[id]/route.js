import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { uploadedFiles } from "../../upload/route";

export async function DELETE(request, { params }) {
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
    
    // Delete file from disk
    try {
      await unlink(fileRecord.path);
    } catch (error) {
      console.error(`Error deleting file from disk: ${error.message}`);
      // Continue even if file delete fails
    }
    
    // Remove file record
    uploadedFiles.splice(fileIndex, 1);
    
    return NextResponse.json({
      message: "File deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file", details: error.message },
      { status: 500 }
    );
  }
}
