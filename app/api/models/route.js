import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define backend model directory path
const MODEL_DIR = path.join(process.cwd(), '..', 'backend', 'model');

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

// GET handler - list all available models
export async function GET() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(MODEL_DIR)) {
      return NextResponse.json({ error: 'Model directory not found' }, { status: 404 });
    }
    
    const files = fs.readdirSync(MODEL_DIR);
    
    // Map of model files to their scaler files
    const modelMap = new Map();
    const scalerFiles = new Set();
    
    // First, identify all scaler files
    files.forEach(file => {
      if (file.startsWith('scaler_')) {
        scalerFiles.add(file);
      }
    });
    
    // Process model files and match with scalers
    const models = [];
    
    files.forEach(file => {
      // Skip directories and scaler files
      if (fs.statSync(path.join(MODEL_DIR, file)).isDirectory() || file.startsWith('scaler_')) {
        return;
      }
      
      // Get model info
      const modelInfo = getModelInfoFromFilename(file);
      if (!modelInfo) return;
      
      // Check for matching scaler file
      const expectedScalerName = `scaler_${modelInfo.name}_v${modelInfo.version}.pkl`;
      const hasScaler = scalerFiles.has(expectedScalerName);
      
      models.push({
        id: `${modelInfo.name}_v${modelInfo.version}`,
        name: modelInfo.name,
        version: modelInfo.version,
        filename: file,
        scalerFilename: hasScaler ? expectedScalerName : null,
        hasScaler: hasScaler,
        createdAt: fs.statSync(path.join(MODEL_DIR, file)).birthtime,
        isActive: file === 'xgb_v1.0.model' // Default active model
      });
    });
    
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: error.message }, 
      { status: 500 }
    );
  }
}

// POST handler - upload a new model
export async function POST(request) {
  // This would handle model uploads - simplified for now
  // In a real implementation, you'd process FormData and save files
  
  return NextResponse.json(
    { error: 'Model upload not implemented yet' }, 
    { status: 501 }
  );
}
