import { useQuery } from '@tanstack/react-query'
import API from '../api/axiosInstance'

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await API.get('/categories')
      return data
    },
  })
}
