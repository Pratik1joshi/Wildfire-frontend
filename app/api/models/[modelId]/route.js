import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define backend model directory path
const MODEL_DIR = path.join(process.cwd(), '..', 'backend', 'model');
const ACTIVE_MODEL_FILE = path.join(MODEL_DIR, 'active_model.json');

// DELETE handler - delete a model
export async function DELETE(request, { params }) {
  const { modelId } = params;
  
  try {
    // Parse modelId to get model name and version
    const [name, version] = modelId.split('_v');
    
    if (!name || !version) {
      return NextResponse.json({ error: 'Invalid model ID format' }, { status: 400 });
    }
    
    // Check if this is the active model
    try {
      if (fs.existsSync(ACTIVE_MODEL_FILE)) {
        const activeModelData = JSON.parse(fs.readFileSync(ACTIVE_MODEL_FILE, 'utf8'));
        if (activeModelData.id === modelId) {
          return NextResponse.json(
            { error: "Cannot delete the active model. Please set another model as active first." },
            { status: 400 }
          );
        }
      }
    } catch (err) {
      console.error("Error checking active model:", err);
      // Continue anyway - better to be safe
    }
    
    // Check if model file exists
    const modelFilename = `${name}_v${version}.model`;
    const modelPath = path.join(MODEL_DIR, modelFilename);
    
    // Check if scaler file exists
    const scalerFilename = `scaler_${name}_v${version}.pkl`;
    const scalerPath = path.join(MODEL_DIR, scalerFilename);
    
    if (!fs.existsSync(modelPath)) {
      return NextResponse.json({ error: 'Model file not found' }, { status: 404 });
    }
    
    // Delete the model file
    fs.unlinkSync(modelPath);
    
    // Delete the scaler file if it exists
    if (fs.existsSync(scalerPath)) {
      fs.unlinkSync(scalerPath);
    }
    
    return NextResponse.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model', details: error.message }, 
      { status: 500 }
    );
  }
}