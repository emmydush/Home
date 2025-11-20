// API client for Household Workers App

class ApiClient {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('token');
    }
    
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }
    
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
    
    // Auth endpoints
    async signup(userData) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
    
    // Worker endpoints
    async getWorkers(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/workers${queryParams ? `?${queryParams}` : ''}`;
        return this.request(endpoint);
    }
    
    async getWorker(id) {
        return this.request(`/workers/${id}`);
    }
    
    async updateWorkerProfile(profileData) {
        return this.request('/workers/profile', {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
    }
    
    // Job endpoints
    async createJob(jobData) {
        return this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }
    
    async getJobs(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/jobs${queryParams ? `?${queryParams}` : ''}`;
        return this.request(endpoint);
    }
    
    async getJob(id) {
        return this.request(`/jobs/${id}`);
    }
    
    async applyForJob(jobId, workerId) {
        return this.request(`/jobs/${jobId}/apply`, {
            method: 'POST',
            body: JSON.stringify({ worker_id: workerId })
        });
    }
}

// Create a global instance
const api = new ApiClient();

// Export for use in other files
window.ApiClient = ApiClient;
window.api = api;