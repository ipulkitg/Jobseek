const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Simple fetch wrapper that includes credentials (cookies)
export const api = {
  async get(endpoint: string) {
    console.log('🌐 API GET:', `${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🌐 API GET Response:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.log('🌐 API GET Error data:', errorData);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('🌐 API GET Success:', data);
    return data;
  },

  async post(endpoint: string, data?: any) {
    console.log('🌐 API POST:', `${API_BASE_URL}${endpoint}`, 'Data:', data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('🌐 API POST Response:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.log('🌐 API POST Error data:', errorData);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log('🌐 API POST Success:', responseData);
    return responseData;
  },

  async put(endpoint: string, data?: any) {
    console.log('🌐 API PUT:', `${API_BASE_URL}${endpoint}`, 'Data:', data);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('🌐 API PUT Response:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.log('🌐 API PUT Error data:', errorData);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log('🌐 API PUT Success:', responseData);
    return responseData;
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }
};

export default api;