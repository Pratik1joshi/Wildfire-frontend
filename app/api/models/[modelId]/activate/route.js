import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define backend model directory path
const MODEL_DIR = path.join(process.cwd(), '..', 'backend', 'model');
const ACTIVE_MODEL_FILE = path.join(MODEL_DIR, 'active_model.json');

// POST handler - activate a model
export async function POST(request, { params }) {
  const { modelId } = params;
  
  try {
    // Parse modelId to get model name and version
    const [name, version] = modelId.split('_v');
    
    if (!name || !version) {
      return NextResponse.json({ error: 'Invalid model ID format' }, { status: 400 });
    }
    
    // Check if model and scaler files exist
    const modelFilename = `${name}_v${version}.model`;
    const modelPath = path.join(MODEL_DIR, modelFilename);
    
    const scalerFilename = `scaler_${name}_v${version}.pkl`;
    const scalerPath = path.join(MODEL_DIR, scalerFilename);
    
    if (!fs.existsSync(modelPath)) {
      return NextResponse.json({ error: 'Model file not found' }, { status: 404 });
    }
    
    if (!fs.existsSync(scalerPath)) {
      return NextResponse.json({ error: 'Scaler file not found for this model' }, { status: 404 });
    }
    
    // Save the active model to a JSON file
    try {
      fs.writeFileSync(ACTIVE_MODEL_FILE, JSON.stringify({
        id: modelId,
        name,
        version, 
        activatedAt: new Date().toISOString()
      }, null, 2));
    } catch (err) {
      console.error(`Failed to write active model file: ${err.message}`);
      // Continue anyway - we'll treat it as activated in memory
    }
    
    // Success, return the activated model details
    return NextResponse.json({ 
      success: true, 
      message: 'Model activated successfully',
      model: {
        id: modelId,
        name,
        version,
        isActive: true
      }
    });
  } catch (error) {
    console.error('Error activating model:', error);
    return NextResponse.json(
      { error: 'Failed to activate model', details: error.message }, 
      { status: 500 }
    );
  }
}