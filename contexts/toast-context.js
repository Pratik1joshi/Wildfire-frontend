"use client";
import { createContext, useContext, useState } from 'react';

const ToastContext = createContext({
  success: () => {},
  error: () => {},
  info: () => {},
  warn: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  
  // Add a toast
  const addToast = (type, message, duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    
    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };
  
  // Toast functions
  const toast = {
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    info: (message) => addToast('info', message),
    warn: (message) => addToast('warning', message),
  };
  
  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`flex items-center p-3 rounded shadow animate-slide-in ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              toast.type === 'info' ? 'bg-blue-500 text-white' :
              'bg-yellow-500 text-white'
            }`}
          >
            <div className="mr-2">
              {toast.type === 'success' && <i className="ri-check-line text-lg"></i>}
              {toast.type === 'error' && <i className="ri-error-warning-line text-lg"></i>}
              {toast.type === 'info' && <i className="ri-information-line text-lg"></i>}
              {toast.type === 'warning' && <i className="ri-alert-line text-lg"></i>}
            </div>
            <div className="flex-1">{toast.message}</div>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white ml-2"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
