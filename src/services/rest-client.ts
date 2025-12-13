const BASE_URL = 'http://localhost:3000';

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Erro na requisição: ${response.statusText}`);
  }
  // Check if content type is json
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }
  return response.text(); // or null if no content
}

export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: async (endpoint: string, body: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: async (endpoint: string, body: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// Domain specific services

export const authService = {
  signIn: (email: string, pass: string) => api.post('/api/auth/sign-in/email', { email, password: pass }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signUp: (userData: any) => api.post('/api/auth/sign-up/email', userData),
};

export const agreementsService = {
  getAll: () => api.get('/agreements'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/agreements', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/agreements/${id}`, data),
  delete: (id: number | string) => api.delete(`/agreements/${id}`),
};

export const usersService = {
  getAll: () => api.get('/users'),
  getById: (id: number | string) => api.get(`/users/${id}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/users', data), // Usually sign-up handles this, but keeping for admin maybe
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number | string) => api.delete(`/users/${id}`),
};

export const patientsService = {
  getAll: () => api.get('/patients'),
  getById: (id: number | string) => api.get(`/patients/${id}`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/patients', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/patients/${id}`, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: (id: number | string, data: any) => api.patch(`/patients/${id}`, data),
  delete: (id: number | string) => api.delete(`/patients/${id}`),
  
  getHistory: (id: number | string) => api.get(`/patients/${id}/history`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHistory: (id: number | string, data: any) => api.post(`/patients/${id}/history`, data), // Assuming POST for adding history item? Or PUT?
  // Checking ProntuarioPage.tsx: const res = await fetch(`http://localhost:3000/patients/${targetPacienteId}/history`, { method: 'POST' ...
  // Yes it is POST.

  getAnamnesis: (id: number | string) => api.get(`/patients/${id}/anamnesis`),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveAnamnesis: (id: number | string, data: any) => api.put(`/patients/${id}/anamnesis`, data),
};

export const tasksService = {
  getAll: () => api.get('/tasks'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/tasks', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/tasks/${id}`, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: (id: number | string, data: any) => api.patch(`/tasks/${id}`, data),
  delete: (id: number | string) => api.delete(`/tasks/${id}`),
};

export const appointmentsService = {
  getAll: () => api.get('/appointments'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/appointments', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/appointments/${id}`, data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: (id: number | string, data: any) => api.patch(`/appointments/${id}`, data),
  delete: (id: number | string) => api.delete(`/appointments/${id}`),
};

export const professionalsService = {
  getAll: () => api.get('/professionals'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/professionals', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/professionals/${id}`, data),
  delete: (id: number | string) => api.delete(`/professionals/${id}`),
};

export const specialtiesService = {
  getAll: () => api.get('/specialties'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (data: any) => api.post('/specialties', data),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (id: number | string, data: any) => api.put(`/specialties/${id}`, data),
  delete: (id: number | string) => api.delete(`/specialties/${id}`),
};

export const externalService = {
    getRandomBibleVerse: async () => {
        const response = await fetch('https://bible-api.com/data/almeida/random');
        if (!response.ok) throw new Error('Failed to fetch bible verse');
        return response.json();
    }
}
