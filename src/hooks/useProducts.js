import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProducts, fetchProduct, createProduct, deleteProduct } from '../api/products'

// List
export const useProducts = (params) => {
  return useQuery(['products', params], fetchProducts, {
    keepPreviousData: true,
    staleTime: 60 * 1000 // 1min
  })
}

// Single product
export const useProduct = (id) => {
  return useQuery(['product', { id }], fetchProduct, {
    enabled: !!id,
    staleTime: 60 * 1000
  })
}

// Create product (admin)
export const useCreateProduct = () => {
  const qc = useQueryClient()
  return useMutation((formData) => createProduct(formData), {
    onSuccess: () => {
      // invalidate lists
      qc.invalidateQueries({ queryKey: ['products'] })
    }
  })
}

// Delete product (admin)
export const useDeleteProduct = () => {
  const qc = useQueryClient()
  return useMutation((id) => deleteProduct(id), {
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product', { id }] })
    }
  })
}
