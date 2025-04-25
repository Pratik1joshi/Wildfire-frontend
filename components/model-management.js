"use client";
import { useState, useEffect, useRef } from "react";

export default function ModelManagement() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState(null);
  
  // Form state
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [modelVersion, setModelVersion] = useState("1.0");
  
  // File inputs
  const modelFileRef = useRef(null);
  const scalerFileRef = useRef(null);
  
  // Add info about backend model directory
  const modelDirectory = "C:\\Users\\ADMIN\\Desktop\\Wildfire_fire_prediction\\newdesign\\backend\\model";
  
  // Fetch models
  useEffect(() => {
    fetchModels();
  }, []);
  
  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/models');
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setModels(data);
    } catch (err) {
      console.error("Error fetching models:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle model upload
  const handleModelUpload = async (e) => {
    e.preventDefault();
    
    if (!modelName || !modelFileRef.current?.files[0] || !scalerFileRef.current?.files[0]) {
      setUploadStatus({ success: false, message: "Please fill all required fields" });
      return;
    }
    
    setUploadStatus({ loading: true, message: "Uploading model..." });
    
    try {
      const formData = new FormData();
      formData.append('name', modelName);
      formData.append('description', modelDescription);
      formData.append('version', modelVersion);
      formData.append('modelFile', modelFileRef.current.files[0]);
      formData.append('scalerFile', scalerFileRef.current.files[0]);
      
      // Validate file types
      const modelFile = modelFileRef.current.files[0];
      const scalerFile = scalerFileRef.current.files[0];
      
      // Modified to accept both .model and .pkl files for models
      if (!modelFile.name.endsWith('.model') && !modelFile.name.endsWith('.pkl')) {
        throw new Error("Model file must be a .model or .pkl file");
      }
      
      if (!scalerFile.name.endsWith('.pkl')) {
        throw new Error("Scaler file must be a .pkl file");
      }
      
      const response = await fetch('/api/models', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload model");
      }
      
      const newModel = await response.json();
      setUploadStatus({ 
        success: true, 
        message: `Model ${newModel.name} (v${newModel.version}) uploaded successfully!` 
      });
      
      // Reset form
      setModelName("");
      setModelDescription("");
      setModelVersion("1.0");
      modelFileRef.current.value = "";
      scalerFileRef.current.value = "";
      
      // Refresh models list
      fetchModels();
      
    } catch (err) {
      setUploadStatus({ success: false, message: err.message || "Failed to upload model" });
    }
  };
  
  // Set a model as active
  const handleSetActiveModel = async (id) => {
    try {
      const response = await fetch(`/api/models/${id}/activate`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to activate model");
      }
      
      // Update local state
      setModels(models.map(model => ({
        ...model,
        isActive: model.id === modelId
      })));
      
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle model deletion
  const handleDeleteModel = async (model) => {
    // Prevent accidental deletion with confirmation
    if (!confirm(`Are you sure you want to delete "${model.name}" (${model.id})? This cannot be undone.`)) {
      return;
    }
    
    setDeleteStatus({ loading: true, modelId: model.id });
    try {
      const response = await fetch(`/api/models/${model.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete model");
      }
      
      // Success - update the models list
      const result = await response.json();
      setDeleteStatus({ 
        success: true, 
        message: `"${model.name}" deleted successfully`,
        modelId: null 
      });
      
      // Remove the model from our local state
      setModels(models.filter(m => m.id !== model.id));
      
      // Clear delete status after a delay
      setTimeout(() => {
        setDeleteStatus(null);
      }, 3000);
      
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteStatus({ 
        success: false, 
        message: err.message || "Failed to delete model",
        modelId: null
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Model Management</h2>
      
      {/* Status Messages */}
      {deleteStatus?.success && (
        <div className="mb-4 p-3 rounded bg-green-50 text-green-700">
          {deleteStatus.message}
        </div>
      )}
      
      {deleteStatus?.success === false && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700">
          {deleteStatus.message}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Models */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Available Models</h3>
          
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : models.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {models.map((model) => (
                    <tr key={model.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{model.name} v{model.version}</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">{model.description || model.id}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(model.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {model.isActive ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetActiveModel(model.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Make Active
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end">
                          {!model.isActive && (
                            <button
                              onClick={() => handleDeleteModel(model)}
                              disabled={deleteStatus?.loading && deleteStatus.modelId === model.id}
                              className="text-red-600 hover:text-red-800 flex items-center"
                            >
                              {deleteStatus?.loading && deleteStatus.modelId === model.id ? (
                                <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></span>
                              ) : (
                                <i className="ri-delete-bin-line mr-1"></i>
                              )}
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No models found</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-2 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        
        {/* Upload New Model */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Upload New Model</h3>
          
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded mb-4">
            <p className="text-sm">
              <span className="font-medium">Note:</span> Uploaded model and scaler files will be stored in the backend model directory: 
              <span className="block mt-1 font-mono text-xs break-all">{modelDirectory}</span>
              Make sure files are in the correct format (.pkl) for compatibility with the Python backend.
            </p>
          </div>
          
          <form onSubmit={handleModelUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Name*
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., XGBoost"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model Version*
              </label>
              <input
                type="text"
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 1.0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the model's features and improvements"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model File* (.pkl)
              </label>
              <input
                type="file"
                ref={modelFileRef}
                accept=".pkl"
                className="w-full block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scaler File* (.pkl)
              </label>
              <input
                type="file"
                ref={scalerFileRef}
                accept=".pkl"
                className="w-full block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
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
                ) : "Upload Model"}
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
      </div>
      
      {/* Add file format information */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-md font-medium text-gray-700 mb-2">Model File Requirements</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li>Model files must be in .model format for XGBoost models</li>
          <li>Scaler files must be in .pkl format</li>
          <li>Files are stored with naming pattern: <span className="font-mono">modelname_v1.0.model</span></li>
          <li>Scaler files are stored with naming pattern: <span className="font-mono">scaler_modelname_v1.0.pkl</span></li>
          <li>Both model and scaler files are required for predictions to work</li>
        </ul>
      </div>
    </div>
  );
}
