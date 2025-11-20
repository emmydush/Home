class API {
    constructor() {
        this.baseURL = '/api';
        this.token = localStorage.getItem('token') || null;
    }
    
    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }
    
    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }
    
    // Make HTTP request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const config = {
            headers,
            ...options
        };
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
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
    
    // Payment endpoints
    async createPayment(paymentData) {
        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(paymentData)
        });
    }
    
    async getPayments(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/payments${queryParams ? `?${queryParams}` : ''}`;
        return this.request(endpoint);
    }
    
    async getPayment(id) {
        return this.request(`/payments/${id}`);
    }
    
    async updatePaymentStatus(paymentId, status) {
        return this.request(`/payments/${paymentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
    
    // Review endpoints
    async createReview(reviewData) {
        return this.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }
    
    async getReviews(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/reviews${queryParams ? `?${queryParams}` : ''}`;
        return this.request(endpoint);
    }
    
    async getReview(id) {
        return this.request(`/reviews/${id}`);
    }
}

const api = new API();