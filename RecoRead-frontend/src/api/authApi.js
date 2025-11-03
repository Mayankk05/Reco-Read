import axiosInstance from './axiosConfig';

export async function register(data) {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data; 
}

export async function login(data) {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data; 
}

export async function getProfile() {
  const res = await axiosInstance.get('/auth/profile');
  return res.data; 
}
