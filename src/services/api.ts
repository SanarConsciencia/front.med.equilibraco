const BASE_URL = 'https://api.medicos.equilibraco.com';

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface MedicoResponse {
  id: number;
  email: string;
  nombre: string;
  // otros campos según la API
}

export const api = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  getMe: async (token: string): Promise<MedicoResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  },
};