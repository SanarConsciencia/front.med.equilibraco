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

export interface Customer {
  customer_uuid: string;
  customer_email: string;
  customer_full_name: string;
  customer_phone: string | null;
  subscription_status: string;
  service_requested: string;
  custom_message: string | null;
  is_active: boolean;
  id: number;
  medico_id: string;
  granted_at: string;
  revoked_at: string | null;
}

export interface CustomerPermissionResponse {
  customer_uuid: string;
  customer_name: string;
  permissions: string[];
  granted_at: string;
  expires_at?: string;
  // otros campos que pueda tener
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

  getCustomers: async (token: string): Promise<Customer[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/customers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get customers');
    }

    return response.json();
  },

  getCustomerPermissions: async (token: string, customerUuid: string): Promise<CustomerPermissionResponse> => {
    const response = await fetch(`${BASE_URL}/api/v1/customers/${customerUuid}/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get customer permissions');
    }

    return response.json();
  },
};