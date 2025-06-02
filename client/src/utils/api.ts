const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleAuthData {
  idToken: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  refreshToken: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async signup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async googleAuth(data: GoogleAuthData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: AuthResponse['user'] }>> {
    return this.request<{ user: AuthResponse['user'] }>('/auth/profile');
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return this.request<{ token: string; refreshToken: string }>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Launch page methods
  async createLaunchPage(data: {
    name: string;
    description?: string;
    tagline?: string;
    colorPalette?: string;
    theme?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/launch-pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLaunchPage(id: string): Promise<ApiResponse<any>> {
    return this.request(`/launch-pages/${id}`);
  }

  async getUserLaunchPages(): Promise<ApiResponse<any[]>> {
    return this.request('/launch-pages/user');
  }

  async updateLaunchPage(id: string, data: {
    name?: string;
    description?: string;
    tagline?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/launch-pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLaunchPage(id: string): Promise<ApiResponse> {
    return this.request(`/launch-pages/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateLaunchPage(id: string): Promise<ApiResponse<any>> {
    return this.request(`/launch-pages/${id}/regenerate`, {
      method: 'POST',
    });
  }

  async publishLaunchPage(id: string, slug: string): Promise<ApiResponse<any>> {
    return this.request(`/launch-pages/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({ slug }),
    });
  }

  getLaunchPagePreviewUrl(id: string): string {
    return `${this.baseURL}/launch-pages/${id}/preview`;
  }
    getPublishedPageUrl(slug: string): string {
    // Use window.location to get the base URL of the frontend
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/${slug}`;
  }

  async getPublishedPage(slug: string): Promise<ApiResponse<any>> {
    return this.request(`/launch-pages/published/${slug}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth utility functions
export const auth = {
  setTokens: (token: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },

  isAuthenticated: (): boolean => {
    return !!auth.getToken();
  },
};
