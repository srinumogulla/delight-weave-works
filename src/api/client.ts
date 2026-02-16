import { toast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.vedhamantra.com';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // ignore parse errors
    }

    if (response.status === 403) {
      errorMessage = 'Access denied. You do not have permission.';
    } else if (response.status === 422) {
      // Try to extract FastAPI validation details
      try {
        const detail = JSON.parse(errorMessage);
        if (Array.isArray(detail)) {
          errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join('; ');
        }
      } catch {
        if (errorMessage === `Request failed (${response.status})`) {
          errorMessage = 'Validation error. Please check your input.';
        }
      }
    } else if (response.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }

    console.error(`API Error [${response.status}]:`, errorMessage);
    toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    return handleResponse<T>(response);
  } catch (error) {
    if (retry && error instanceof TypeError && error.message.includes('fetch')) {
      // Network error - retry once
      await new Promise((r) => setTimeout(r, 1000));
      const response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });
      return handleResponse<T>(response);
    }
    throw error;
  }
}

export function apiGet<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T = any>(path: string, body?: any): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T = any>(path: string, body?: any): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T = any>(path: string, body?: any): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = any>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export function apiPostForm<T = any>(path: string, data: Record<string, string>): Promise<T> {
  const body = new URLSearchParams(data).toString();
  return request<T>(path, {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

export async function apiUpload<T = any>(path: string, file: File, fieldName = 'file'): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Don't set Content-Type - browser sets it with boundary for multipart
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });
  return handleResponse<T>(response);
}
