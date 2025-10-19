import axios from 'axios'

const API = axios.create({
  baseURL: 'https://dsbackend-ifve.onrender.com/api',
})

API.interceptors.request.use((config) => {
  const adminKey = localStorage.getItem('adminKey')
  if (adminKey) config.headers['x-admin-key'] = adminKey
  return config
})

export default API
