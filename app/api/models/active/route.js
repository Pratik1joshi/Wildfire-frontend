import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

// Path to model directory 
const MODELS_DIR = path.join(process.cwd(), '..', 'backend', 'model');
const ACTIVE_MODEL_FILE = path.join(MODELS_DIR, 'active_model.json');

// Helper function to get model info from filename
function getModelInfoFromFilename(filename) {
  // Skip scaler files - we'll associate them with models later
  if (filename.startsWith('scaler_')) return null;
  
  // Parse model filename (e.g., xgb_v1.0.model)
  const match = filename.match(/(.+?)_v([0-9.]+)\.model/);
  if (!match) return null;
  
  const [, name, version] = match;
  return { name, version };
}

// Helper function to get all models
async function getAllModels() {
  // Ensure the directory exists
  if (!fs.existsSync(MODELS_DIR)) {
    throw new Error('Model directory not found');
  }
  
  const files = fs.readdirSync(MODELS_DIR);
  
  const scalerFiles = new Set();
  files.forEach(file => {
    if (file.startsWith('scaler_')) {
      scalerFiles.add(file);
    }
  });
  
  const models = [];
  let activeModelId = null;
  
  // Try to read active model ID from file
  try {
    if (fs.existsSync(ACTIVE_MODEL_FILE)) {
      const activeModelData = JSON.parse(fs.readFileSync(ACTIVE_MODEL_FILE, 'utf8'));
      activeModelId = activeModelData.id;
    }
  } catch(err) {
    console.error(`Failed to read active model file: ${err.message}`);
  }
  
  files.forEach(file => {
    // Skip directories and scaler files
    if (fs.statSync(path.join(MODELS_DIR, file)).isDirectory() || file.startsWith('scaler_')) {
      return;
    }
    
    const modelInfo = getModelInfoFromFilename(file);
    if (!modelInfo) return;
    
    const expectedScalerName = `scaler_${modelInfo.name}_v${modelInfo.version}.pkl`;
    const hasScaler = scalerFiles.has(expectedScalerName);
    
    const modelId = `${modelInfo.name}_v${modelInfo.version}`;
    models.push({
      id: modelId,
      name: modelInfo.name,
      version: modelInfo.version,
      filename: file,
      scalerFilename: hasScaler ? expectedScalerName : null,
      hasScaler: hasScaler,
      createdAt: fs.statSync(path.join(MODELS_DIR, file)).birthtime,
      isActive: activeModelId ? modelId === activeModelId : file === 'xgb_v1.0.model' // Default active model
    });
  });
  
  return models;
}

// GET handler for active model
export async function GET() {
  try {
    let activeModelId = "xgb_v1.0"; // Default active model

    // Try to read active model ID from file
    try {
      if (fs.existsSync(ACTIVE_MODEL_FILE)) {
        const activeModelData = JSON.parse(fs.readFileSync(ACTIVE_MODEL_FILE, 'utf8'));
        activeModelId = activeModelData.id;
      }
    } catch(err) {
      console.error(`Failed to read active model file: ${err.message}`);
    }
    
    // Get all models
    const models = await getAllModels();
    
    // Find the active model
    let activeModel = models.find(model => model.id === activeModelId);
    
    // If no matching model found, use the first available model
    if (!activeModel && models.length > 0) {
      activeModel = models[0];
      
      // Update the active model file
      try {
        fs.writeFileSync(ACTIVE_MODEL_FILE, JSON.stringify({ 
          id: activeModel.id,
          activatedAt: new Date().toISOString()
        }, null, 2));
      } catch(err) {
        console.error(`Failed to write active model file: ${err.message}`);
      }
    }
    
    if (!activeModel) {
      return NextResponse.json({ error: "No active model found" }, { status: 404 });
    }
    
    return NextResponse.json(activeModel);
  } catch (error) {
    console.error("Error fetching active model:", error);
    return NextResponse.json({ error: "Failed to fetch active model" }, { status: 500 });
  }
}
