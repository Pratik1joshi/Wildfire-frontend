import api from '@/utils/api';

export const adminApi = {
  // User management
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  deleteUser: async (userId) => {
    return await api.delete(`/admin/users/${userId}`);
  },
  
  // Alert management
  getAlerts: async () => {
    const response = await api.get('/admin/alerts');
    return response.data;
  },
  
  createAlert: async (alertData) => {
    const response = await api.post('/admin/alerts', alertData);
    return response.data;
  },
  
  updateAlert: async (alertId, alertData) => {
    const response = await api.put(`/admin/alerts/${alertId}`, alertData);
    return response.data;
  },
  
  deleteAlert: async (alertId) => {
    return await api.delete(`/admin/alerts/${alertId}`);
  },
  
  // Prediction alerts
  generatePredictionAlerts: async (date = null) => {
    const response = await api.post('/admin/generate-prediction-alerts', 
      date ? { date } : {}
    );
    return response.data;
  },
  
  // Upload predictions
  uploadPredictions: async (formData) => {
    const response = await api.post('/admin/upload-predictions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Get available dates
  getAvailableDates: async () => {
    const response = await api.get('/available-dates');
    return response.data;
  },
  
  getPublicAlerts: async () => {
    const response = await api.get('/public/alerts');
    return response.data;
  },
  
  // Dashboard summary
  getDashboardStats: async () => {
    const [users, alerts] = await Promise.all([
      adminApi.getUsers(),
      adminApi.getAlerts()
    ]);
    
    return {
      users,
      alerts,
      userStats: {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
      },
      alertStats: {
        total: alerts.length,
        active: alerts.filter(a => a.is_active).length,
        byLevel: {
          info: alerts.filter(a => a.level === 'info').length,
          warning: alerts.filter(a => a.level === 'warning').length,
          danger: alerts.filter(a => a.level === 'danger').length,
        }
      }
    };
  }
};

export default adminApi;
