/**
 * API Service
 * Handles all backend API calls
 */

import { authUtils } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://career-master-ai.onrender.com/api';

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
  profilePicture?: string;
  roles: string[];
  status: string;
  profile?: {
    // Personal Details
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | Date;
    gender?: string;
    guardianName?: string;
    guardianRelation?: string;
    
    // Contact Details
    alternateMobile?: string;
    whatsappNumber?: string;
    whatsappSameAsMobile?: boolean;
    
    // Address Details
    presentAddress?: {
      houseNo?: string;
      street?: string;
      area?: string;
      city?: string;
      district?: string;
      state?: string;
      pinCode?: string;
      country?: string;
    };
    permanentAddress?: {
      houseNo?: string;
      street?: string;
      area?: string;
      city?: string;
      district?: string;
      state?: string;
      pinCode?: string;
      country?: string;
    };
    sameAsPresentAddress?: boolean;
    
    // Academic Details
    currentQualification?: string;
    institutionName?: string;
    university?: string;
    yearOfStudy?: number;
    expectedPassingYear?: number;
    percentage?: number;
    cgpa?: number;
    gradeType?: string;
    
    // Course Preferences
    selectedCourses?: string[];
    
    // Legacy fields
    college?: string;
    school?: string;
    jobTitle?: string;
    currentStatus?: string;
    interests?: string[];
    learningGoals?: string;
    city?: string;
    country?: string;
  };
  verification?: {
    emailVerified?: boolean;
    phoneVerified?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Get auth token from localStorage
   */
  private getToken(): string | null {
    return authUtils.getAccessToken();
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = authUtils.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error?.message || data.message || 'Token refresh failed');
        }

        // Save new tokens
        if (data.data?.tokens) {
          authUtils.saveTokens(data.data.tokens);
        }
      } catch (error) {
        // If refresh fails, clear auth
        authUtils.clearAuth();
        // Redirect to login if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Make API request with automatic token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
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

      // Try to parse JSON, but handle cases where response is not JSON
      let data: any = null;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      try {
        const text = await response.text();
        if (text) {
          data = isJson ? JSON.parse(text) : { message: text };
        } else {
          data = { message: 'Empty response' };
        }
      } catch (parseError) {
        // If JSON parsing fails, create a basic error object
        data = {
          error: {
            message: `Server error (${response.status}): ${response.statusText}`
          },
          message: `Server error (${response.status}): ${response.statusText}`
        };
      }

      // If 401 and we haven't retried yet, try to refresh token
      if (response.status === 401 && retryCount === 0 && !endpoint.includes('/auth/')) {
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          return this.request<T>(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          // Refresh failed, throw original error
          throw new Error(data?.error?.message || data?.message || 'Authentication failed');
        }
      }

      if (!response.ok) {
        const errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
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

  async directSignup(
    email: string,
    name: string,
    password: string,
    phone?: string
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/signup-direct', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, phone }),
    });
  }

  async googleAuth(idToken: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
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
    availableFrom?: string;
    availableTo?: string;
    batches?: string[];
    availableToEveryone?: boolean;
    isActive?: boolean;
    level?: 'beginner' | 'intermediate' | 'advanced' | null;
    questions?: {
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      marks?: number;
      negativeMarks?: number;
    }[];
    useSections?: boolean;
    sections?: unknown[];
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

  // Get available quizzes for a user (by email)
  async getAvailableQuizzesForUser(email: string, level?: 'beginner' | 'intermediate' | 'advanced'): Promise<ApiResponse> {
    const q = level ? `?level=${level}` : '';
    return this.request(`/quizzes/user/email/${email}${q}`, { method: 'GET' });
  }

  // Submit quiz attempt
  async submitQuizAttempt(quizId: string, payload: {
    email: string;
    answers: Record<string, number>;
    timeSpentInSeconds?: number;
  }): Promise<ApiResponse> {
    return this.request(`/quizzes/${quizId}/attempt`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Get user attempts for a specific quiz
  async getUserQuizAttemptsForQuiz(quizId: string): Promise<ApiResponse> {
    return this.request(`/quizzes/${quizId}/attempts`, {
      method: 'GET',
    });
  }

  // Get user dashboard statistics
  async getUserDashboardStats(): Promise<ApiResponse> {
    return this.request('/dashboard/user/stats', {
      method: 'GET',
    });
  }

  // Reports & Leaderboard
  async getTopPerformers(options?: {
    limit?: number;
    quizId?: string;
    batchId?: string;
    sortBy?: 'averageScore' | 'totalMarks' | 'totalAttempts' | 'bestScore';
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.quizId) params.append('quizId', options.quizId);
    if (options?.batchId) params.append('batchId', options.batchId);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    
    const query = params.toString();
    return this.request(`/reports/top-performers${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getUserRankAndComparison(userId: string, options?: {
    quizId?: string;
    batchId?: string;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (options?.quizId) params.append('quizId', options.quizId);
    if (options?.batchId) params.append('batchId', options.batchId);
    
    const query = params.toString();
    return this.request(`/reports/user-rank/${userId}${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getQuizLeaderboard(quizId: string, limit?: number): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    
    const query = params.toString();
    return this.request(`/reports/quiz-leaderboard/${quizId}${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  // Quiz Report Generation
  async getQuizAttemptReport(attemptId: string): Promise<ApiResponse> {
    return this.request(`/reports/quiz-attempt/${attemptId}`, {
      method: 'GET',
    });
  }

  async downloadPDFReport(attemptId: string): Promise<Blob> {
    const token = this.getToken();
    const url = `${this.baseURL}/reports/quiz-attempt/${attemptId}/pdf`;
    
    console.log('Downloading PDF from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDF download failed:', response.status, errorText);
      throw new Error(`Failed to download PDF report: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/pdf')) {
      const errorText = await response.text();
      console.error('Invalid content type:', contentType, errorText);
      throw new Error('Invalid response: expected PDF file');
    }

    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Empty PDF file received');
    }

    return blob;
  }

  async downloadExcelReport(attemptId: string): Promise<Blob> {
    const token = this.getToken();
    const url = `${this.baseURL}/reports/quiz-attempt/${attemptId}/excel`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download Excel report');
    }

    return response.blob();
  }

  // Get all user quiz attempts (for reports) with filters
  async getUserQuizAttempts(filters?: {
    quizId?: string;
    subjectId?: string;
    topicId?: string;
    dateFrom?: string;
    dateTo?: string;
    minScore?: number;
    maxScore?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.quizId) params.append('quizId', filters.quizId);
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.topicId) params.append('topicId', filters.topicId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.minScore !== undefined) params.append('minScore', String(filters.minScore));
    if (filters?.maxScore !== undefined) params.append('maxScore', String(filters.maxScore));
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    
    const query = params.toString();
    return this.request(`/reports/user-quiz-attempts${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async updateQuiz(id: string, payload: {
    title?: string;
    description?: string;
    durationMinutes?: number;
    availableFrom?: string;
    availableTo?: string;
    batches?: string[];
    questions?: {
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      marks?: number;
      negativeMarks?: number;
    }[];
    isActive?: boolean;
    level?: 'beginner' | 'intermediate' | 'advanced' | null;
  }): Promise<ApiResponse> {
    return this.request(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteQuiz(id: string): Promise<ApiResponse> {
    return this.request(`/quizzes/${id}`, {
      method: 'DELETE',
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

  // Image Upload
  async uploadImage(file: File, folder?: string): Promise<ApiResponse> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('image', file);
    if (folder) {
      formData.append('folder', folder);
    }

    const url = `${this.baseURL}/upload/image`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || data.message || 'Failed to upload image');
    }

    return data;
  }

  async uploadImageBase64(base64String: string, folder?: string): Promise<ApiResponse> {
    return this.request('/upload/image-base64', {
      method: 'POST',
      body: JSON.stringify({
        image: base64String,
        folder: folder || 'career-master/quiz-images'
      }),
    });
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

  async updateBatch(id: string, payload: {
    name?: string;
    code?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    return this.request(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteBatch(id: string): Promise<ApiResponse> {
    return this.request(`/batches/${id}`, {
      method: 'DELETE',
    });
  }

  async getBatchById(id: string): Promise<ApiResponse> {
    return this.request(`/batches/${id}`, {
      method: 'GET',
    });
  }

  async addStudentsToBatch(batchCode: string, userIds: string[]): Promise<ApiResponse> {
    return this.request(`/batches/${batchCode}/students`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  async removeStudentsFromBatch(batchCode: string, userIds: string[]): Promise<ApiResponse> {
    return this.request(`/batches/${batchCode}/students`, {
      method: 'DELETE',
      body: JSON.stringify({ userIds }),
    });
  }

  async getBatchStudents(batchCode: string, page = 1, limit = 10): Promise<ApiResponse> {
    const params = new URLSearchParams({
      batchCode,
      page: String(page),
      limit: String(limit),
    });
    return this.request(`/batches/students/paginated?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Users admin endpoints
  async getUserById(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'GET',
    });
  }

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

  async updateUser(id: string, payload: {
    name?: string;
    email?: string;
    phone?: string;
    roles?: string[];
    batches?: string[];
    status?: 'active' | 'banned';
  }): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
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

  async updateCurrentUser(payload: Partial<{
    name: string;
    phone: string;
    profile: {
      college?: string;
      school?: string;
      jobTitle?: string;
      currentStatus?: string;
      interests?: string[];
      learningGoals?: string;
      city?: string;
      country?: string;
    };
  }>): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Dashboard endpoints
  async getDashboardStatistics(): Promise<ApiResponse> {
    return this.request('/dashboard/statistics', {
      method: 'GET',
    });
  }

  // Subjects (admin + user)
  async getSubjects(params: { page?: number; limit?: number; isActive?: boolean; level?: 'beginner' | 'intermediate' | 'advanced' } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params.level) query.set('level', params.level);
    const queryString = query.toString();
    return this.request(`/subjects${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  async createSubject(payload: {
    title: string;
    description?: string;
    thumbnail?: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    requiresApproval?: boolean;
    order?: number;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/subjects', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Subject Join Requests
  async getSubjectRequests(params: { status?: string; page?: number; limit?: number } = {}): Promise<ApiResponse> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    return this.request(`/subjects/requests?${queryParams.toString()}`);
  }

  async approveSubjectRequest(requestId: string): Promise<ApiResponse> {
    return this.request(`/subjects/requests/${requestId}/approve`, {
      method: 'POST',
    });
  }

  async rejectSubjectRequest(requestId: string, notes?: string): Promise<ApiResponse> {
    return this.request(`/subjects/requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async createSubjectRequest(payload: { subjectId: string; email?: string; phone?: string }): Promise<ApiResponse> {
    return this.request('/subjects/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSubject(id: string, payload: Partial<{
    title: string;
    description?: string;
    thumbnail?: string;
    category?: string;
    level?: 'beginner' | 'intermediate' | 'advanced';
    requiresApproval?: boolean;
    order?: number;
    isActive?: boolean;
  }>): Promise<ApiResponse> {
    return this.request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteSubject(id: string): Promise<ApiResponse> {
    return this.request(`/subjects/${id}`, { method: 'DELETE' });
  }

  async bulkUpdateSubjectOrders(orders: Array<{ id: string; order: number }>): Promise<ApiResponse> {
    return this.request('/subjects/orders', { method: 'PUT', body: JSON.stringify({ orders }) });
  }

  // Topics
  async getTopics(
    subjectId?: string,
    isActive?: boolean,
    parentTopicId?: string | 'roots' | null
  ): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (subjectId) query.set('subjectId', subjectId);
    if (isActive !== undefined) query.set('isActive', String(isActive));
    if (parentTopicId === 'roots' || parentTopicId === null) {
      query.set('parentTopicId', 'roots');
    } else if (parentTopicId && parentTopicId !== 'roots') {
      query.set('parentTopicId', parentTopicId);
    }
    const qs = query.toString();
    return this.request(`/topics${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async createTopic(payload: {
    subjectId: string;
    title: string;
    description?: string;
    order?: number;
    prerequisites?: string[];
    requiredQuizzesToUnlock?: number;
    parentTopicId?: string | null;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/topics', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateTopic(id: string, payload: Partial<{
    subjectId: string;
    title: string;
    description?: string;
    order?: number;
    prerequisites?: string[];
    requiredQuizzesToUnlock?: number;
    parentTopicId?: string | null;
    isActive?: boolean;
  }>): Promise<ApiResponse> {
    return this.request(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteTopic(id: string): Promise<ApiResponse> {
    return this.request(`/topics/${id}`, { method: 'DELETE' });
  }

  async bulkUpdateTopicOrders(orders: Array<{ id: string; order: number }>): Promise<ApiResponse> {
    return this.request('/topics/orders', { method: 'PUT', body: JSON.stringify({ orders }) });
  }

  // Cheatsheets
  async getCheatSheetByTopic(topicId: string): Promise<ApiResponse> {
    return this.request(`/cheatsheets/topic/${topicId}`, { method: 'GET' });
  }

  async createCheatSheet(payload: {
    topicId: string;
    content: string;
    contentType?: 'html' | 'markdown' | 'text';
    estReadMinutes?: number;
    resources?: { title: string; url: string; type?: 'link' | 'video' | 'document' }[];
  }): Promise<ApiResponse> {
    return this.request('/cheatsheets', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateCheatSheet(id: string, payload: Partial<{
    topicId: string;
    content: string;
    contentType?: 'html' | 'markdown' | 'text';
    estReadMinutes?: number;
    resources?: { title: string; url: string; type?: 'link' | 'video' | 'document' }[];
  }>): Promise<ApiResponse> {
    return this.request(`/cheatsheets/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  // Topic Progress
  async getTopicProgress(topicId: string, cacheBuster?: number): Promise<ApiResponse> {
    const url = cacheBuster 
      ? `/topic-progress/topic/${topicId}?_t=${cacheBuster}`
      : `/topic-progress/topic/${topicId}`;
    return this.request(url, { method: 'GET' });
  }

  async getSubjectProgress(subjectId: string): Promise<ApiResponse> {
    return this.request(`/topic-progress/subject/${subjectId}`, { method: 'GET' });
  }

  async getStudentProgress(): Promise<ApiResponse> {
    return this.request('/topic-progress', { method: 'GET' });
  }

  async markCheatSheetRead(topicId: string): Promise<ApiResponse> {
    return this.request('/topic-progress/cheat-viewed', { method: 'POST', body: JSON.stringify({ topicId }) });
  }

  // Quiz sets
  async getQuizSetsByTopic(topicId: string, isActive?: boolean): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (isActive !== undefined) query.set('isActive', String(isActive));
    const qs = query.toString();
    return this.request(`/quiz-sets/topic/${topicId}${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async getQuizSetsByQuiz(quizId: string): Promise<ApiResponse> {
    return this.request(`/quiz-sets/quiz/${quizId}`, { method: 'GET' });
  }

  async createQuizSet(payload: {
    topicId: string;
    quizId: string;
    setName?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/quiz-sets', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateQuizSet(id: string, payload: Partial<{
    topicId: string;
    quizId: string;
    setName?: string;
    order?: number;
    isActive?: boolean;
  }>): Promise<ApiResponse> {
    return this.request(`/quiz-sets/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteQuizSet(id: string): Promise<ApiResponse> {
    return this.request(`/quiz-sets/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();

