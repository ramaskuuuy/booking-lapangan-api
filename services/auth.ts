import api from '@/library/axios';

export const login = async (email: string, password: string) => {
  const res = await api.post('/login', { email, password });
  localStorage.setItem('token', res.data.token);
  return res.data;
};

export const register = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  password_confirmation: string
) => {
  const res = await api.post('/register', { name, email, phone, password, password_confirmation });
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post('/forgot-password', { email });
  return res.data;
};

export const logout = async () => {
  await api.post('/logout');
  localStorage.removeItem('token');
};