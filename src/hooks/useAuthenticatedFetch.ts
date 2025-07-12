import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';

export const useAuthenticatedFetch = () => {
  const { logout } = useAuth();
  const { config } = useConfig();

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${config?.VITE_API_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
    });

    if (res.status === 401) {
      logout();
      return null;
    }

    return res;
  };

  return apiFetch;
};
