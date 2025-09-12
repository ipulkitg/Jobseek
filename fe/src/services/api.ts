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
      let fullErrorDetails = '';
      try {
        const errorData = await response.json();
        console.log('🌐 API GET Error data:', errorData);
        fullErrorDetails = JSON.stringify(errorData, null, 2);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
        console.log('🌐 API GET: Could not parse error response as JSON');
      }
      console.error('❌ API GET Failed:', {
        url: `${API_BASE_URL}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        fullErrorDetails
      });
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('🌐 API GET Success:', data);
    return data;
  },

  async post(endpoint: string, data?: any) {
    console.log('🌐 API POST:', `${API_BASE_URL}${endpoint}`, 'Data:', data);
    
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf='))
      ?.split('=')[1];
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      console.log('🔐 API POST: Including CSRF token');
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('🌐 API POST Response:', response.status, response.statusText);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let fullErrorDetails = '';
      try {
        const errorData = await response.json();
        console.log('🌐 API POST Error data:', errorData);
        fullErrorDetails = JSON.stringify(errorData, null, 2);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Ignore JSON parsing errors, use default message
        console.log('🌐 API POST: Could not parse error response as JSON');
      }
      console.error('❌ API POST Failed:', {
        url: `${API_BASE_URL}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        fullErrorDetails,
        requestData: data
      });
      throw new Error(errorMessage);
    }
    
    const responseData = await response.json();
    console.log('🌐 API POST Success:', responseData);
    return responseData;
  },

  async put(endpoint: string, data?: any) {
    console.log('🌐 API PUT:', `${API_BASE_URL}${endpoint}`, 'Data:', data);
    
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrf='))
      ?.split('=')[1];
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
      console.log('🔐 API PUT: Including CSRF token');
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      credentials: 'include', // Include cookies
      headers,
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