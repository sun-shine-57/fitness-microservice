import axios from 'axios'

const API_URL = 'https://api-gateway-361654592537.asia-south1.run.app/api/';

const api = axios.create({
    baseURL:API_URL
})

api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId'); 
    const token = localStorage.getItem('token');

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (userId) {
        config.headers['X-User-ID'] = userId;
    }
    return config;
}
);

export const getActivities = () => api.get('/activities');
export const addActivity = (activity) => api.post('/activities', activity);
export const getActivityDetail = (id) => api.get(`/recommendations/activity/${id}`);