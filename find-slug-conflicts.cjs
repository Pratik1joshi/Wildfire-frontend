const fs = require('fs');
const path = require('path');

// Define the app directory to search
const appDir = path.join(__dirname, 'app');

// Function to recursively search directories for route.js files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Check if directory name is a dynamic route
      if (file.startsWith('[') && file.endsWith(']')) {
        console.log(`Found dynamic route: ${file} at ${filePath}`);
      }
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.js' || file === 'route.ts') {
      const content = fs.readFileSync(filePath, 'utf8');
      // Look for params.id or params.modelId usage
      if (content.includes('params.id') || content.includes('{ id }') || 
          content.includes('params.modelId') || content.includes('{ modelId }')) {
        console.log(`Potential conflict in: ${filePath}`);
        console.log(`Contains id param: ${content.includes('params.id') || content.includes('{ id }')}`);
        console.log(`Contains modelId param: ${content.includes('params.modelId') || content.includes('{ modelId }')}`);
      }
    }
  });
  
  return fileList;
}

console.log('Searching for potential slug conflicts...');
findRouteFiles(appDir);
console.log('Done.');