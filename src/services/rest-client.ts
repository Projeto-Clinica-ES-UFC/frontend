/**
 * REST API Client for es-clinica frontend
 * 
 * This module provides typed service functions for all backend API endpoints.
 * All requests include credentials for session-based authentication.
 */

const BASE_URL = 'http://localhost:3000';

/**
 * Returns default headers for API requests
 */
const getAuthHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.message || `Erro na requisição: ${response.statusText}`, data);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return response.text() as unknown as T;
}

// =============================================================================
// Base API Methods
// =============================================================================

/**
 * Low-level API wrapper for making HTTP requests
 */
export const api = {
  /**
   * Makes a GET request
   * @param endpoint - API endpoint (e.g., '/appointments')
   */
  get: async <T = unknown>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  /**
   * Makes a POST request
   * @param endpoint - API endpoint
   * @param body - Request body (will be JSON stringified)
   */
  post: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  /**
   * Makes a PUT request
   * @param endpoint - API endpoint
   * @param body - Request body (will be JSON stringified)
   */
  put: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  /**
   * Makes a PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body (will be JSON stringified)
   */
  patch: async <T = unknown>(endpoint: string, body: unknown): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  /**
   * Makes a DELETE request
   * @param endpoint - API endpoint
   */
  delete: async <T = unknown>(endpoint: string): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },
};

// =============================================================================
// Users Service
// =============================================================================

/**
 * Service for user management
 * 
 * Endpoints:
 * - GET /users - List all users (admin panel)
 * - PATCH /users/:id - Update user (admin panel)
 * - DELETE /users/:id - Delete user (admin panel)
 * 
 * Note: User creation is handled via Better Auth (/api/auth/sign-up)
 */
export const usersService = {
  /**
   * GET /users - List all users
   * @returns Array of users with id, name, email, role
   */
  getAll: () => api.get('/users'),

  /**
   * PATCH /users/:id - Update a user
   * Used by: UsuariosPanel, MeuPerfilPage
   * @param id - User ID
   * @param data - Fields to update (name, email, role, password?)
   */
  update: (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/users/${id}`, data),

  /**
   * DELETE /users/:id - Delete a user
   * Used by: UsuariosPanel
   * @param id - User ID
   */
  delete: (id: number | string) => api.delete(`/users/${id}`),
};

// =============================================================================
// Patients Service
// =============================================================================

/**
 * Service for patient management
 * 
 * Endpoints:
 * - GET /patients - List all patients
 * - GET /patients/:id - Get patient by ID
 * - POST /patients - Create patient
 * - PATCH /patients/:id - Update patient
 * - DELETE /patients/:id - Delete patient
 * - GET /patients/:id/medical-record - Get patient's medical records
 * - POST /patients/:id/medical-record - Create medical record entry
 * - GET /patients/:id/anamnesis - Get patient's anamnesis
 * - PUT /patients/:id/anamnesis - Save/update anamnesis
 */
export const patientsService = {
  /**
   * GET /patients - List all patients
   * Used by: HomePage, AgendamentosPage, AgendaProfissionalPage, PacientesPanel
   * 
   * Response fields: id, name, cpf, dateOfBirth, responsibleName, responsiblePhone
   * Frontend maps: name→nome, dateOfBirth→dataNascimento, etc.
   */
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/patients${query}`);
  },

  /**
   * GET /patients/:id - Get patient by ID
   * Used by: ProntuarioPage, AnamnesePage
   */
  getById: (id: number | string) => api.get(`/patients/${id}`),

  /**
   * POST /patients - Create a new patient
   * Used by: PacientesPanel
   * @param data - Patient data (name, cpf, dateOfBirth, responsibleName, responsiblePhone)
   */
  create: (data: Record<string, unknown>) => api.post('/patients', data),

  /**
   * PATCH /patients/:id - Update patient
   * Used by: PacientesPanel
   */
  update: (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/patients/${id}`, data),

  /**
   * DELETE /patients/:id - Delete patient
   * Used by: PacientesPanel
   */
  delete: (id: number | string) => api.delete(`/patients/${id}`),

  // --- Medical Record Sub-routes ---

  /**
   * GET /patients/:id/medical-record - Get patient's medical history/timeline
   * Used by: ProntuarioPage
   * @returns Array of medical record entries (id, date, type, title, description)
   */
  getHistory: (id: number | string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/patients/${id}/medical-record${query}`);
  },

  /**
   * POST /patients/:id/medical-record - Create medical record entry
   * Used by: ProntuarioPage (HistoricoFormModal)
   * @param data - Entry data (date, type, title, description)
   */
  createHistory: (id: number | string, data: Record<string, unknown>) =>
    api.post(`/patients/${id}/medical-record`, data),

  /**
   * PATCH /patients/:id/medical-record/:eventId - Update medical record entry
   * Used by: ProntuarioPage (HistoricoFormModal edit mode)
   */
  updateHistory: (patientId: number | string, eventId: number | string, data: Record<string, unknown>) =>
    api.patch(`/patients/${patientId}/medical-record/${eventId}`, data),

  /**
   * DELETE /patients/:id/medical-record/:eventId - Delete medical record entry
   * Used by: ProntuarioPage
   */
  deleteHistory: (patientId: number | string, eventId: number | string) =>
    api.delete(`/patients/${patientId}/medical-record/${eventId}`),
};

// =============================================================================
// Appointments Service
// =============================================================================

/**
 * Service for appointment/scheduling management
 * 
 * Endpoints:
 * - GET /appointments - List all appointments
 * - POST /appointments - Create appointment
 * - PATCH /appointments/:id - Update appointment (including status changes)
 * - DELETE /appointments/:id - Delete appointment
 */
export const appointmentsService = {
  /**
   * GET /appointments - List all appointments
   * Used by: HomePage, AgendamentosPage, AgendaProfissionalPage
   * 
   * Supports query params: page, limit, professionalId, patientId, startDate, endDate, status[]
   * Response: Array of { id, start, end, status, pacienteId, profissionalId, pendenciaUnimed }
   */
  getAll: (params?: Record<string, string | string[]>) => {
    if (!params) return api.get('/appointments');

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.append(key, value);
      }
    });
    return api.get(`/appointments?${searchParams.toString()}`);
  },

  /**
   * POST /appointments - Create a new appointment
   * Used by: AgendamentosPage, AgendaProfissionalPage
   * @param data - Appointment data (start, end, status, pacienteId, profissionalId, pendenciaUnimed)
   */
  create: (data: Record<string, unknown>) => api.post('/appointments', data),

  /**
   * PATCH /appointments/:id - Update appointment
   * Used by: AgendamentosPage (edit, status change, drag-drop), AgendaProfissionalPage
   * @param data - Fields to update
   */
  update: (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/appointments/${id}`, data),

  /**
   * DELETE /appointments/:id - Delete appointment
   * Used by: AgendamentosPage, AgendaProfissionalPage
   */
  delete: (id: number | string) => api.delete(`/appointments/${id}`),
};

// =============================================================================
// Professionals Service
// =============================================================================

/**
 * Service for professional (staff) management
 * 
 * Endpoints:
 * - GET /professionals - List all professionals
 * - POST /professionals - Create professional (also creates linked user)
 * - PATCH /professionals/:id - Update professional
 * - DELETE /professionals/:id - Delete professional
 */
export const professionalsService = {
  /**
   * GET /professionals - List all professionals
   * Used by: AgendamentosPage, AgendaProfissionalPage, ProfissionaisPanel
   * 
   * Response: { data: [...] } or [...] - Array of { id, name, email, specialty }
   * Frontend maps: name→nome, specialty→especialidade
   */
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get(`/professionals${query}`);
  },

  /**
   * POST /professionals - Create a new professional
   * Used by: ProfissionaisPanel
   * 
   * Note: Backend creates a linked User record automatically
   * @param data - Professional data (name, email, specialty)
   */
  create: (data: Record<string, unknown>) => api.post('/professionals', data),

  /**
   * PATCH /professionals/:id - Update professional
   * Used by: ProfissionaisPanel
   */
  update: (id: number | string, data: Record<string, unknown>) =>
    api.patch(`/professionals/${id}`, data),

  /**
   * DELETE /professionals/:id - Delete professional
   * Used by: ProfissionaisPanel
   */
  delete: (id: number | string) => api.delete(`/professionals/${id}`),
};

// =============================================================================
// External Services
// =============================================================================

/**
 * Service for third-party API integrations
 */
export const externalService = {
  /**
   * Fetches a random Bible verse from external API
   * Used by: HomePage (daily verse widget)
   */
  getRandomBibleVerse: async () => {
    const response = await fetch('https://bible-api.com/data/almeida/random');
    if (!response.ok) throw new Error('Failed to fetch bible verse');
    return response.json();
  }
};
