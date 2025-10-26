import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API from '../api/axiosInstance'

// ✅ Fetch all product templates
export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data } = await API.get('/product-templates', {
        headers: { 'x-admin-key': 'SAREE_ADMIN_2024' },
      })
      return data
    },
  })
}

// ✅ Create a new template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (template) => {
      // 🧠 Backend expects productName (same as name)
      // and also requires templateName, name, category, price
      const payload = {
        ...template,
        productName: template.name,
        price: Number(template.price),
      }

      const { data } = await API.post('/product-templates', payload, {
        headers: { 'x-admin-key': 'SAREE_ADMIN_2024' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}
