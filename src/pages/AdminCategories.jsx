import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Loader2, Check } from 'lucide-react'
import API from '../api/axiosInstance'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Loader from '../components/loader'

const AdminCategories = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // ✅ Fetch categories from backend
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await API.get('/categories')
      return data
    },
  })

  // ✅ Create category
  const createMutation = useMutation({
    mutationFn: async () => await API.post('/categories', formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      setSuccess(true)
      setFormData({ name: '', slug: '', description: '', image: '' })
      setTimeout(() => setSuccess(false), 2000)
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create category'),
  })

  // ✅ Delete category
  const deleteMutation = useMutation({
    mutationFn: async (id) => await API.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['categories']),
  })

  // ✅ Handle admin auth
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth')
    if (!isAuth) navigate('/admin-login')
  }, [navigate])

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'name' && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: value.toLowerCase().replace(/\s+/g, '-') }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.slug) {
      setError('Name and slug are required.')
      return
    }
    setError('')
    createMutation.mutate()
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Categories</h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mb-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="e.g. silk-sarees"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL (optional)</label>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-6 py-3 rounded-lg">{error}</div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 px-6 py-3 rounded-lg flex items-center gap-2">
                <Check className="w-5 h-5" />
                Category created successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex justify-center items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Create Category
                </>
              )}
            </button>
          </form>

          {/* Category List */}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Existing Categories</h2>
          {isLoading ? (
            <p className="text-gray-500"><Loader/></p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    <p className="text-sm text-gray-600">{cat.slug}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(cat._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminCategories
