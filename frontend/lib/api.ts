/**
 * API Service
 * Handles all backend API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
  error?: {
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  status: string;
  verification: {
    emailVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get auth token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit =
      typeof options.headers === 'function' || options.headers instanceof Headers
        ? options.headers
        : {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          };

    const finalHeaders =
      token && !(headers instanceof Headers)
        ? { ...headers, Authorization: `Bearer ${token}` }
        : headers;

    try {
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async signup(email: string): Promise<ApiResponse> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyOtp(
    email: string,
    otp: string,
    name: string,
    password: string,
    phone?: string
  ): Promise<ApiResponse<User>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, name, password, phone }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Quiz admin endpoints
  async createQuiz(payload: {
    title: string;
    description?: string;
    durationMinutes: number;
    questions: {
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      marks?: number;
      negativeMarks?: number;
    }[];
  }): Promise<ApiResponse> {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Quizzes (user + admin)
  async getQuizById(id: string): Promise<ApiResponse> {
    return this.request(`/quizzes/${id}`, {
      method: 'GET',
    });
  }

  async getQuizzes(page = 1, limit = 10): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return this.request(`/quizzes?${params.toString()}`, {
      method: 'GET',
    });
  }

  async uploadQuizExcel(formData: FormData): Promise<ApiResponse> {
    const token = this.getToken();
    const url = `${this.baseURL}/quizzes/upload-excel`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Request failed');
    }

    return data;
  }

  // Batches admin endpoints
  async getBatches(page = 1, limit = 10): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return this.request(`/batches?${params.toString()}`, {
      method: 'GET',
    });
  }

  async createBatch(payload: {
    name: string;
    code: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Users admin endpoints
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    batch?: string;
  } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.batch) query.set('batch', params.batch);

    return this.request(`/users?${query.toString()}`, {
      method: 'GET',
    });
  }

  async createUser(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    roles?: string[];
    batches?: string[];
  }): Promise<ApiResponse> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logoutAll(): Promise<ApiResponse> {
    return this.request('/auth/logout-all', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/me');
  }
}

export const apiService = new ApiService();

