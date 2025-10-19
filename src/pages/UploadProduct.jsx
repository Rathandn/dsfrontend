import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import API from '../api/axiosInstance'
import { useQuery } from '@tanstack/react-query'

const UploadProduct = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    category: '', // will store category _id
    price: '',
    description: '',
    material: '',
    color: '',
  })
  const [images, setImages] = useState([])
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ✅ Fetch categories from new Category collection
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await API.get('/categories')
      return data
    },
  })

  // ✅ Admin authentication check
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth')
    if (!isAuth) navigate('/admin-login')
  }, [navigate])

  // ✅ Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // ✅ Submit to backend
 const handleSubmit = async (e) => {
  e.preventDefault()

  if (images.length === 0) {
    alert('Please upload at least one image')
    return
  }

  try {
    setLoading(true)
    setError('')

    const form = new FormData()
    Object.entries(formData).forEach(([key, value]) => form.append(key, value))

    // ✅ Append all selected images
    images.forEach((img) => form.append('images', img.file))

    // ✅ Append main image URL (based on index)
    const mainImageFile = images[mainImageIndex]?.file
    if (mainImageFile) {
      form.append('mainImageIndex', mainImageIndex)
    }

    // ✅ Send form data to backend
    const res = await API.post('/products', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-admin-key': 'SAREE_ADMIN_2024',
      },
    })

    console.log('✅ Uploaded product:', res.data)
    setSuccess(true)
    setTimeout(() => navigate('/admin'), 2000)
  } catch (err) {
    console.error('❌ Upload failed:', err)
    setError(err.response?.data?.message || 'Upload failed')
  } finally {
    setLoading(false)
  }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Upload New Product</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                {isLoading ? (
                  <p className="text-gray-500">Loading categories...</p>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Image Upload Section */}
            <ImageUploader
              images={images}
              setImages={setImages}
              mainImageIndex={mainImageIndex}
              setMainImageIndex={setMainImageIndex}
            />

            {/* Success / Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3"
              >
                <Check className="w-5 h-5" />
                Product uploaded successfully! Redirecting...
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-700 px-6 py-4 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Uploading...
                </>
              ) : (
                'Upload Product'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default UploadProduct
