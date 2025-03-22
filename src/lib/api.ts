// API service to handle all backend requests
const API_URL = 'http://localhost:5002/api';

// Store authentication token
let authToken: string | null = null;

// Initialize - check for existing token
const initializeAuth = () => {
  try {
    // Check local storage for existing token
    authToken = localStorage.getItem('token');
    console.log('API initialized with token:', authToken ? 'Token exists' : 'No token');
  } catch (error) {
    console.error('Error initializing auth:', error);
    authToken = null;
  }
};

// Set auth token
export const setAuthToken = (token: string) => {
  try {
    authToken = token;
    localStorage.setItem('token', token);
    console.log('Auth token set successfully');
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Clear auth token
export const clearAuthToken = () => {
  try {
    authToken = null;
    localStorage.removeItem('token');
    console.log('Auth token cleared successfully');
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

// Helper to get auth headers
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// API request wrapper with error handling
const apiRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`Making ${method} request to ${url}`);
    
    const options: RequestInit = {
      method,
      headers: getHeaders(),
    };

    if (data) {
      options.body = JSON.stringify(data);
      console.log('Request payload:', method === 'POST' ? data : 'Data omitted for privacy');
    }

    const response = await fetch(url, options);
    
    // Handle no response from server
    if (!response) {
      console.error('No response received from server');
      throw new Error('Network error. Please try again later.');
    }
    
    let result;
    try {
      result = await response.json();
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error('Invalid response from server');
    }

    console.log(`Response from ${url}:`, endpoint.includes('password') ? 'Response omitted for privacy' : result);

    if (!response.ok) {
      console.error(`API Error (${response.status}):`, result.message || 'Unknown error');
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear token on auth failures
        if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
          clearAuthToken();
        }
      }
      
      throw new Error(result.message || 'Something went wrong');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// File upload helper
export const uploadFile = async (
  endpoint: string, 
  file: File,
  additionalFields: Record<string, string> = {}
) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const formData = new FormData();
    
    formData.append('file', file);
    
    // Add any additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: formData,
    };
    
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'File upload failed');
    }
    
    return result;
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: (userData: any) => apiRequest('/auth/register', 'POST', userData),
  login: (credentials: any) => apiRequest('/auth/login', 'POST', credentials),
  getCurrentUser: () => apiRequest('/auth/me'),
};

// User APIs
export const userAPI = {
  getProfile: (userId: string) => apiRequest(`/users/${userId}`),
  updateProfile: (userData: any) => apiRequest('/users/profile', 'PUT', userData),
  followUser: (userId: string) => apiRequest(`/users/${userId}/follow`, 'PUT'),
};

// Event APIs
export const eventAPI = {
  getEvents: (params: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    
    return apiRequest(`/events?${queryParams.toString()}`);
  },
  getEvent: (eventId: string) => apiRequest(`/events/${eventId}`),
  createEvent: (eventData: any) => apiRequest('/events', 'POST', eventData),
  updateEvent: (eventId: string, eventData: any) => 
    apiRequest(`/events/${eventId}`, 'PUT', eventData),
  deleteEvent: (eventId: string) => apiRequest(`/events/${eventId}`, 'DELETE'),
  registerForEvent: (eventId: string) => 
    apiRequest(`/events/${eventId}/register`, 'POST'),
  unregisterFromEvent: (eventId: string) => 
    apiRequest(`/events/${eventId}/register`, 'DELETE'),
};

// Post APIs
export const postAPI = {
  getPosts: (params: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    
    return apiRequest(`/posts?${queryParams.toString()}`);
  },
  getPost: (postId: string) => apiRequest(`/posts/${postId}`),
  createPost: (postData: any) => apiRequest('/posts', 'POST', postData),
  updatePost: (postId: string, postData: any) => 
    apiRequest(`/posts/${postId}`, 'PUT', postData),
  deletePost: (postId: string) => apiRequest(`/posts/${postId}`, 'DELETE'),
  likePost: (postId: string) => apiRequest(`/posts/${postId}/like`, 'PUT'),
  addComment: (postId: string, comment: string) => 
    apiRequest(`/posts/${postId}/comments`, 'POST', { text: comment }),
  deleteComment: (postId: string, commentId: string) => 
    apiRequest(`/posts/${postId}/comments/${commentId}`, 'DELETE'),
};

// Initialize authentication on load
initializeAuth();

export default {
  auth: authAPI,
  users: userAPI,
  events: eventAPI,
  posts: postAPI,
}; 