import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('haven_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('haven_token');
            localStorage.removeItem('haven_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
    getMe: () => api.get('/auth/me'),
    changePassword: (current_password, new_password) => api.put('/auth/change-password', { current_password, new_password }),
    updateProfile: (data) => api.put('/auth/profile', data),
};

// Admin APIs
export const adminAPI = {
    getUsers: (status, role) => api.get('/admin/users', { params: { status, role } }),
    updateUserStatus: (userId, status) => api.put(`/admin/users/${userId}/status`, { status }),
    changeUserPassword: (userId, new_password) => api.put(`/admin/users/${userId}/password`, { new_password }),
    updateAdminProfile: (data) => api.put('/admin/profile', data),
    getAnalytics: () => api.get('/admin/analytics'),
    getAuditLogs: (limit = 100) => api.get('/admin/audit-logs', { params: { limit } }),
    getPaymentSettings: () => api.get('/admin/payment-settings'),
    updatePaymentSettings: (data) => api.put('/admin/payment-settings', data),
    uploadQRCode: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/admin/payment-settings/qr-code', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    getSMTPSettings: () => api.get('/admin/smtp-settings'),
    updateSMTPSettings: (data) => api.put('/admin/smtp-settings', data),
    getSiteSettings: () => api.get('/site-settings'),
    updateSiteSettings: (data) => api.put('/admin/site-settings', data),
};

// Public APIs
export const publicAPI = {
    getSiteSettings: () => api.get('/site-settings'),
    getEvents: () => api.get('/events'),
    getEvent: (id) => api.get(`/events/${id}`),
};

// Event APIs (Admin)
export const eventsAPI = {
    getAll: () => api.get('/admin/events'),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/admin/events', data),
    update: (id, data) => api.put(`/admin/events/${id}`, data),
    delete: (id) => api.delete(`/admin/events/${id}`),
    uploadImage: (id, file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/admin/events/${id}/upload-image`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Rehab Centers APIs
export const rehabCentersAPI = {
    getAll: (status) => api.get('/rehab-centers', { params: { status } }),
    getById: (id) => api.get(`/rehab-centers/${id}`),
    create: (data) => api.post('/rehab-centers', data),
    update: (id, data) => api.put(`/rehab-centers/${id}`, data),
    delete: (id) => api.delete(`/rehab-centers/${id}`),
};

// Addiction Types APIs
export const addictionTypesAPI = {
    getAll: () => api.get('/addiction-types'),
    create: (data) => api.post('/addiction-types', data),
    update: (id, data) => api.put(`/addiction-types/${id}`, data),
    delete: (id) => api.delete(`/addiction-types/${id}`),
};

// Donations APIs
export const donationsAPI = {
    getPaymentInfo: () => api.get('/donations/payment-info'),
    getPatients: () => api.get('/donations/patients'),
    submit: (formData) => api.post('/donations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getAll: (status) => api.get('/donations', { params: { status } }),
    getById: (id) => api.get(`/donations/${id}`),
    track: (transactionId) => api.get(`/donations/track/${transactionId}`),
    approve: (id, status, admin_remarks) => api.put(`/donations/${id}/approve`, { status, admin_remarks }),
    getReceipt: (id) => api.get(`/donations/${id}/receipt`),
};

// Treatment Requests APIs
export const treatmentAPI = {
    create: (data) => api.post('/treatment-requests', data),
    getAll: (status) => api.get('/treatment-requests', { params: { status } }),
    respond: (id, response) => api.put(`/treatment-requests/${id}/respond`, null, { params: { response } }),
    updateNotes: (id, treatment_notes, status) => api.put(`/treatment-requests/${id}/notes`, { treatment_notes, status }),
};

// Doctors APIs
export const doctorsAPI = {
    getApproved: () => api.get('/doctors'),
    uploadVerificationDoc: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/doctors/verification-document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    updateProfileData: (data) => api.put('/doctors/profile-data', data),
};

export default api;
