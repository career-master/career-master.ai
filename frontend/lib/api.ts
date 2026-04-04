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
  /** Total count for paginated responses (e.g. admin user-quiz-attempts) */
  total?: number;
  /** Leaderboard / top-performers when `page` query is sent */
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          headers: finalHeaders,
        });
      } catch (fetchError) {
        // "Failed to fetch" = network unreachable (backend down, wrong URL, CORS, etc.)
        if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
          throw new Error(
            `Cannot reach the API at ${API_BASE_URL}. Check that the backend is running and NEXT_PUBLIC_API_URL matches it (e.g. http://localhost:3000/api or http://localhost:4000/api).`
          );
        }
        throw fetchError;
      }

      // Some endpoints (like DELETE /users/:id) return 204 No Content.
      // Treat any successful 204 as a successful response with no body.
      if (response.status === 204) {
        return {
          success: true,
          message: 'No content',
        } as ApiResponse<T>;
      }

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
        let errorMessage = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
        // If server returned HTML (e.g. 404 page), avoid throwing the whole document
        if (typeof errorMessage === 'string' && (errorMessage.trimStart().startsWith('<') || errorMessage.length > 500)) {
          errorMessage = `Request failed with status ${response.status}. The server may have returned a page instead of JSON — check that NEXT_PUBLIC_API_URL points to your backend (e.g. http://localhost:4000/api), not the Next.js app.`;
        }
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
    level?: 'basic' | 'hard' | null;
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

  async getQuizzes(
    page = 1,
    limit = 10,
    opts?: { all?: boolean; domain?: string; subjectId?: string; topicId?: string }
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (opts?.all) params.set('all', '1');
    if (opts?.domain) params.set('domain', opts.domain);
    if (opts?.subjectId) params.set('subjectId', opts.subjectId);
    if (opts?.topicId) params.set('topicId', opts.topicId);
    return this.request(`/quizzes?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Get available quizzes for a user (by email)
  async getAvailableQuizzesForUser(email: string, level?: 'basic' | 'hard'): Promise<ApiResponse> {
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
    page?: number;
    quizId?: string;
    batchId?: string;
    /** When set, only attempts tied to this subject (via topic → quiz set) are counted */
    subjectId?: string;
    /** Optional root topic; narrows to attempts tagged with this topic */
    topicId?: string;
    sortBy?: 'averageScore' | 'totalMarks' | 'totalAttempts' | 'bestScore';
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.page != null && options.page >= 1) params.append('page', String(options.page));
    if (options?.quizId) params.append('quizId', options.quizId);
    if (options?.batchId) params.append('batchId', options.batchId);
    if (options?.subjectId) params.append('subjectId', options.subjectId);
    if (options?.topicId) params.append('topicId', options.topicId);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    
    const query = params.toString();
    return this.request(`/reports/top-performers${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getUserRankAndComparison(userId: string, options?: {
    quizId?: string;
    batchId?: string;
    subjectId?: string;
    topicId?: string;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (options?.quizId) params.append('quizId', options.quizId);
    if (options?.batchId) params.append('batchId', options.batchId);
    if (options?.subjectId) params.append('subjectId', options.subjectId);
    if (options?.topicId) params.append('topicId', options.topicId);
    
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

  async deleteUserQuizAttempt(attemptId: string): Promise<ApiResponse> {
    return this.request(`/reports/quiz-attempt/${attemptId}`, {
      method: 'DELETE',
    });
  }

  // Admin: get quiz attempts across users with filters + pagination
  async getAdminUserQuizAttempts(filters?: {
    quizId?: string;
    subjectId?: string;
    domain?: string;
    category?: string;
    topicId?: string;
    email?: string;
    name?: string;
    batchScope?: 'all' | 'batch_only' | 'non_batch';
    batchCode?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.quizId) params.append('quizId', filters.quizId);
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.domain) params.append('domain', filters.domain);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.topicId) params.append('topicId', filters.topicId);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.batchScope) params.append('batchScope', filters.batchScope);
    if (filters?.batchCode) params.append('batchCode', filters.batchCode);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const query = params.toString();
    return this.request(`/reports/admin/user-quiz-attempts${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  // Admin: cumulative report (non-deleted data)
  async getAdminCumulativeQuizSummary(filters?: {
    quizId?: string;
    subjectId?: string;
    domain?: string;
    category?: string;
    topicId?: string;
    email?: string;
    name?: string;
    batchScope?: 'all' | 'batch_only' | 'non_batch';
    batchCode?: string;
  }): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.quizId) params.append('quizId', filters.quizId);
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.domain) params.append('domain', filters.domain);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.topicId) params.append('topicId', filters.topicId);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.name) params.append('name', filters.name);
    if (filters?.batchScope) params.append('batchScope', filters.batchScope);
    if (filters?.batchCode) params.append('batchCode', filters.batchCode);

    const query = params.toString();
    return this.request(`/reports/admin/cumulative-quiz-summary${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async getAdminUserCumulativeQuizReport(
    userId: string,
    filters?: {
      subjectId?: string;
      domain?: string;
      category?: string;
      topicId?: string;
    }
  ): Promise<ApiResponse> {
    const params = new URLSearchParams();
    if (filters?.subjectId) params.append('subjectId', filters.subjectId);
    if (filters?.domain) params.append('domain', filters.domain);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.topicId) params.append('topicId', filters.topicId);

    const query = params.toString();
    return this.request(`/reports/admin/user-cumulative-quiz-report/${userId}${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  async deleteAdminQuizAttempt(attemptId: string): Promise<ApiResponse> {
    return this.request(`/reports/admin/quiz-attempt/${attemptId}`, {
      method: 'DELETE',
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
    level?: 'basic' | 'hard' | null;
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

  /** Admin: delete all quizzes and attempts (super_admin / content_admin only) */
  async deleteAllQuizzes(): Promise<ApiResponse> {
    return this.request('/quizzes/admin/all', {
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

  // Institutions (admin)
  async getInstitutions(
    page = 1,
    limit = 10,
    search = '',
    opts?: {
      institutionType?: string;
      location?: string;
      minStudentStrength?: string;
      maxStudentStrength?: string;
      sortBy?: 'createdAt' | 'institutionName' | 'studentStrength';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<ApiResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search.trim()) params.set('search', search.trim());
    if (opts?.institutionType?.trim()) params.set('institutionType', opts.institutionType.trim());
    if (opts?.location?.trim()) params.set('location', opts.location.trim());
    if (opts?.minStudentStrength?.trim()) params.set('minStudentStrength', opts.minStudentStrength.trim());
    if (opts?.maxStudentStrength?.trim()) params.set('maxStudentStrength', opts.maxStudentStrength.trim());
    if (opts?.sortBy) params.set('sortBy', opts.sortBy);
    if (opts?.sortOrder) params.set('sortOrder', opts.sortOrder);
    return this.request(`/institutions?${params.toString()}`, { method: 'GET' });
  }

  async getInstitutionById(id: string): Promise<ApiResponse> {
    return this.request(`/institutions/${id}`, { method: 'GET' });
  }

  async createInstitution(payload: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/institutions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateInstitution(id: string, payload: Record<string, unknown>): Promise<ApiResponse> {
    return this.request(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteInstitution(id: string): Promise<ApiResponse> {
    return this.request(`/institutions/${id}`, { method: 'DELETE' });
  }

  /** Subject certificates (admin + student my-list) */
  async getCertificateEligible(params: {
    subjectId: string;
    minAverage?: number;
    batchScope?: string;
    batchCode?: string;
    /** Limits eligibility to quizzes under these topic roots + subtopics (comma-separated) */
    topicIds?: string;
  }): Promise<ApiResponse> {
    const q = new URLSearchParams({ subjectId: params.subjectId });
    if (params.minAverage != null) q.set('minAverage', String(params.minAverage));
    if (params.batchScope) q.set('batchScope', params.batchScope);
    if (params.batchCode) q.set('batchCode', params.batchCode);
    if (params.topicIds && params.topicIds.trim()) q.set('topicIds', params.topicIds.trim());
    return this.request(`/certificates/eligible?${q.toString()}`, { method: 'GET' });
  }

  /** All students with any attempt on subject quizzes + pass / avg (admin). */
  async getCertificateSubjectProgress(params: {
    subjectId: string;
    minAverage?: number;
    batchScope?: string;
    batchCode?: string;
    topicIds?: string;
  }): Promise<ApiResponse> {
    const q = new URLSearchParams({ subjectId: params.subjectId });
    if (params.minAverage != null) q.set('minAverage', String(params.minAverage));
    if (params.batchScope) q.set('batchScope', params.batchScope);
    if (params.batchCode) q.set('batchCode', params.batchCode);
    if (params.topicIds && params.topicIds.trim()) q.set('topicIds', params.topicIds.trim());
    return this.request(`/certificates/subject-progress?${q.toString()}`, { method: 'GET' });
  }

  async generateSubjectCertificates(payload: {
    subjectId: string;
    userIds: string[];
    minAverage?: number;
    batchScope?: string;
    batchCode?: string;
    sendEmail?: boolean;
    topicScopeIds?: string[];
  }): Promise<ApiResponse> {
    return this.request('/certificates/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async listSubjectCertificates(
    page = 1,
    limit = 20,
    subjectId?: string,
    search?: string
  ): Promise<ApiResponse> {
    const q = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (subjectId) q.set('subjectId', subjectId);
    if (search && search.trim()) q.set('search', search.trim());
    return this.request(`/certificates?${q.toString()}`, { method: 'GET' });
  }

  async getMyCertificates(): Promise<ApiResponse> {
    return this.request('/certificates/my', { method: 'GET' });
  }

  async getCertificateById(id: string): Promise<ApiResponse> {
    return this.request(`/certificates/${id}`, { method: 'GET' });
  }

  async updateCertificate(
    id: string,
    body: { recipientName?: string; issuedOnText?: string }
  ): Promise<ApiResponse> {
    return this.request(`/certificates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteCertificate(id: string): Promise<ApiResponse> {
    return this.request(`/certificates/${id}`, { method: 'DELETE' });
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

  // App settings (GET public; PUT admin)
  async getSettings(): Promise<ApiResponse<{ profileCompletionEnforced: boolean; profileMinCompletionPercent: number }>> {
    return this.request('/settings', { method: 'GET' });
  }

  async updateSettings(payload: {
    profileCompletionEnforced?: boolean;
    profileMinCompletionPercent?: number;
  }): Promise<ApiResponse<{ profileCompletionEnforced: boolean; profileMinCompletionPercent: number }>> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Subjects (admin + user)
  async getSubjects(params: { page?: number; limit?: number; isActive?: boolean; domain?: string; category?: string; level?: 'basic' | 'hard' } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params.domain) query.set('domain', params.domain);
    if (params.category) query.set('category', params.category);
    if (params.level) query.set('level', params.level);
    const queryString = query.toString();
    return this.request(`/subjects${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  }

  async createSubject(payload: {
    title: string;
    description?: string;
    thumbnail?: string;
    domain?: string;
    category?: string;
    level?: 'basic' | 'hard';
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
    domain?: string;
    category?: string;
    level?: 'basic' | 'hard';
    requiresApproval?: boolean;
    order?: number;
    isActive?: boolean;
  }>): Promise<ApiResponse> {
    return this.request(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async getSubjectById(id: string): Promise<ApiResponse> {
    return this.request(`/subjects/${id}`, { method: 'GET' });
  }

  async deleteSubject(id: string): Promise<ApiResponse> {
    return this.request(`/subjects/${id}`, { method: 'DELETE' });
  }

  async bulkUpdateSubjectOrders(orders: Array<{ id: string; order: number }>): Promise<ApiResponse> {
    return this.request('/subjects/orders', { method: 'PUT', body: JSON.stringify({ orders }) });
  }

  /** Domains master list (for all Domain dropdowns). Add new domains from Subjects & Topics → Manage Domains. */
  async getDomains(params?: { active?: boolean }): Promise<ApiResponse> {
    const q = params?.active !== undefined ? `?active=${params.active}` : '';
    return this.request(`/domains${q}`, { method: 'GET' });
  }

  async createDomain(payload: { name: string; order?: number; isActive?: boolean }): Promise<ApiResponse> {
    return this.request('/domains', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateDomain(id: string, payload: { name?: string; order?: number; isActive?: boolean }): Promise<ApiResponse> {
    return this.request(`/domains/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteDomain(id: string): Promise<ApiResponse> {
    return this.request(`/domains/${id}`, { method: 'DELETE' });
  }

  /** Categories for a domain (for Category dropdowns). Add from Subjects & Topics → Manage Categories. */
  async getCategories(params?: { domain?: string; active?: boolean }): Promise<ApiResponse> {
    const q = new URLSearchParams();
    if (params?.domain) q.set('domain', params.domain);
    if (params?.active !== undefined) q.set('active', String(params.active));
    const qs = q.toString();
    return this.request(`/categories${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async createCategory(payload: { domain: string; name: string; order?: number; isActive?: boolean }): Promise<ApiResponse> {
    return this.request('/categories', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateCategory(id: string, payload: { name?: string; order?: number; isActive?: boolean }): Promise<ApiResponse> {
    return this.request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  /** Flattened mapping list for Manage Mapping (domain, category, subject, sub-topic rows) */
  async getMappingList(): Promise<ApiResponse> {
    return this.request('/subjects/mapping-list', { method: 'GET' });
  }

  /** Bulk delete mapping rows (subjects and/or topics) */
  async bulkDeleteMapping(payload: { subjectIds?: string[]; topicIds?: string[] }): Promise<ApiResponse> {
    return this.request('/subjects/mapping/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({
        subjectIds: payload.subjectIds || [],
        topicIds: payload.topicIds || [],
      }),
    });
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
    quizNumber?: number | null;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    return this.request('/quiz-sets', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateQuizSet(id: string, payload: Partial<{
    topicId: string;
    quizId: string;
    setName?: string;
    order?: number;
    quizNumber?: number | null;
    isActive?: boolean;
  }>): Promise<ApiResponse> {
    return this.request(`/quiz-sets/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteQuizSet(id: string): Promise<ApiResponse> {
    return this.request(`/quiz-sets/${id}`, { method: 'DELETE' });
  }

  // Announcements (updates, trainings, exams)
  async getAnnouncementsPublic(params: { type?: 'update' | 'training' | 'exam'; limit?: number } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.request(`/announcements${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async getAnnouncementsAdmin(params: {
    type?: 'update' | 'training' | 'exam';
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse> {
    const query = new URLSearchParams();
    if (params.type) query.set('type', params.type);
    if (params.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.request(`/announcements/admin${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  async createAnnouncement(payload: {
    title: string;
    description: string;
    type: 'update' | 'training' | 'exam';
    dateText?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    linkUrl?: string;
    linkLabel?: string;
    isActive?: boolean;
    order?: number;
  }): Promise<ApiResponse> {
    return this.request('/announcements', { method: 'POST', body: JSON.stringify(payload) });
  }

  async updateAnnouncement(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      type: 'update' | 'training' | 'exam';
      dateText?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
      linkUrl?: string;
      linkLabel?: string;
      isActive?: boolean;
      order?: number;
    }>
  ): Promise<ApiResponse> {
    return this.request(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  async deleteAnnouncement(id: string): Promise<ApiResponse> {
    return this.request(`/announcements/${id}`, { method: 'DELETE' });
  }

  async getAnnouncementById(id: string): Promise<ApiResponse> {
    return this.request(`/announcements/${id}`, { method: 'GET' });
  }
}

export const apiService = new ApiService();

