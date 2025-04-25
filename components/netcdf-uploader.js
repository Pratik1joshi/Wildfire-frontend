"use client";
import { useState, useEffect, useRef } from 'react';

export default function NetCDFUploader() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const descriptionRef = useRef(null);
  
  // Fetch the list of NC files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);
  
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/netcdf/files');
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    const file = fileInputRef.current?.files[0];
    const description = descriptionRef.current?.value || '';
    
    if (!file) {
      setUploadStatus({ success: false, message: "Please select a file to upload" });
      return;
    }
    
    if (!file.name.endsWith('.nc')) {
      setUploadStatus({ success: false, message: "Only NetCDF (.nc) files are allowed" });
      return;
    }
    
    setUploadStatus({ loading: true, message: "Uploading file..." });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      const response = await fetch('/api/netcdf/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload file");
      }
      
      const result = await response.json();
      setUploadStatus({ 
        success: true, 
        message: `File ${result.filename} uploaded successfully!` 
      });
      
      // Reset form
      fileInputRef.current.value = '';
      descriptionRef.current.value = '';
      
      // Refresh files list
      fetchFiles();
    } catch (err) {
      setUploadStatus({ success: false, message: err.message || "Failed to upload file" });
    }
  };
  
  const handleProcessFile = async (fileId) => {
    try {
      const response = await fetch(`/api/netcdf/process/${fileId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process file");
      }
      
      // Update file status in the UI
      setFiles(files.map(file => 
        file.id === fileId ? { ...file, status: 'Processing' } : file
      ));
      
      // Poll for updates
      pollFileStatus(fileId);
      
    } catch (err) {
      console.error("Error processing file:", err);
      alert(`Error: ${err.message}`);
    }
  };
  
  const pollFileStatus = async (fileId) => {
    // Poll for file status every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/netcdf/status/${fileId}`);
        if (!response.ok) {
          clearInterval(interval);
          return;
        }
        
        const fileData = await response.json();
        
        // Update file in the UI
        setFiles(prevFiles => prevFiles.map(file => 
          file.id === fileId ? fileData : file
        ));
        
        // If processing is complete or failed, stop polling
        if (fileData.status === 'Completed' || fileData.status === 'Failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Error polling file status:", err);
        clearInterval(interval);
      }
    }, 3000);
    
    // Clean up interval after 5 minutes (timeout)
    setTimeout(() => clearInterval(interval), 300000);
  };
  
  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/netcdf/files/${fileId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete file");
      }
      
      // Remove file from the UI
      setFiles(files.filter(file => file.id !== fileId));
      
    } catch (err) {
      console.error("Error deleting file:", err);
      alert(`Error: ${err.message}`);
    }
  };
  
  const handleViewResults = async (fileId) => {
    try {
      const response = await fetch(`/api/netcdf/results/${fileId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch results");
      }
      
      const results = await response.json();
      
      // Display results in a modal or alert
      alert(JSON.stringify(results, null, 2));
      
    } catch (err) {
      console.error("Error viewing results:", err);
      alert(`Error: ${err.message}`);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Upload NetCDF File Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload NetCDF File</h2>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4">
          <p className="text-sm">
            <span className="font-medium">Note:</span> Upload NetCDF (.nc) files for weather data processing.
            Files will be processed and stored in the backend model directory for wildfire prediction.
          </p>
        </div>
        
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NetCDF File* (.nc)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".nc"
              className="w-full block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              ref={descriptionRef}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add a description for this file"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors disabled:bg-blue-300"
              disabled={uploadStatus?.loading}
            >
              {uploadStatus?.loading ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Uploading...
                </span>
              ) : "Upload File"}
            </button>
          </div>
          
          {/* Upload Status Message */}
          {uploadStatus && !uploadStatus.loading && (
            <div className={`p-3 rounded ${
              uploadStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {uploadStatus.message}
            </div>
          )}
        </form>
      </div>
      
      {/* Uploaded Files Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Uploaded NetCDF Files</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{file.original_filename || file.filename}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{file.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.upload_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${file.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          file.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                          file.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {file.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        {file.status === 'Pending' && (
                          <button
                            onClick={() => handleProcessFile(file.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Process
                          </button>
                        )}
                        {file.status === 'Completed' && (
                          <button
                            onClick={() => handleViewResults(file.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Results
                          </button>
                        )}
                        {file.status === 'Failed' && (
                          <button
                            onClick={() => handleProcessFile(file.id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No NetCDF files uploaded yet</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
      
      {/* Usage Instructions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use NetCDF Files</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700">
          <li>Upload a NetCDF file containing weather data (.nc format)</li>
          <li>Click "Process" to extract and analyze the data</li>
          <li>The system will process the data and store it in the database</li>
          <li>Once processing is complete, the data will be available for wildfire prediction</li>
          <li>The prediction pipeline will automatically use the latest processed data</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">
          <p className="text-sm">
            <span className="font-medium">Important:</span> Ensure your NetCDF files contain the required variables 
            (temperature, precipitation, soil moisture, etc.) for accurate wildfire predictions.
          </p>
        </div>
      </div>
    </div>
  );
}
