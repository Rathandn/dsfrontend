import API from './axiosInstance'

// GET all products (public)
export const fetchProducts = async () => {
  const { data } = await API.get('/products')
  return data
}

// GET single product (public)
export const fetchProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`)
  return data
}

// CREATE product (admin only)
export const createProduct = async (formData) => {
  const { data } = await API.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// DELETE product (admin only)
export const deleteProduct = async (id) => {
  const { data } = await API.delete(`/products/${id}`)
  return data
}
