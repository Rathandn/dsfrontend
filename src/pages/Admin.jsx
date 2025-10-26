import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Upload,
  Package,
  LogOut,
  TrendingUp,
  Trash2,
  Filter,
  X,
  Loader,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import API from '../api/axiosInstance'

const Admin = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [filterCategory, setFilterCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [showDeleteSection, setShowDeleteSection] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // ✅ Auth Check
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth')
    if (!isAuth) navigate('/admin-login')
  }, [navigate])

  // ✅ Fetch Products & Categories
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await API.get('/products')
      return data
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await API.get('/products/categories')
      return data
    },
  })

  // ✅ Delete Product Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => await API.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['products']),
  })

  // ✅ Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = filterCategory ? p.category === filterCategory : true
    const matchesMin = minPrice ? p.price >= parseFloat(minPrice) : true
    const matchesMax = maxPrice ? p.price <= parseFloat(maxPrice) : true
    return matchesCategory && matchesMin && matchesMax
  })

  const handleSelectProduct = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p._id))
    }
  }

  const handleDeleteSelected = async () => {
    for (const id of selectedProducts) {
      await deleteMutation.mutateAsync(id)
    }
    setSelectedProducts([])
    setShowConfirmDialog(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminKey')
    navigate('/admin-login')
  }

  const resetFilters = () => {
    setFilterCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  if (isLoading) {
    return (
      <p className="text-center mt-20 text-gray-600"><Loader/></p>
    )
  }

  const stats = [
    { icon: Package, label: 'Total Products', value: products.length, color: 'bg-blue-500' },
    { icon: TrendingUp, label: 'Categories', value: categories.length, color: 'bg-green-500' },
    { icon: Upload, label: 'Recent Uploads', value: Math.min(products.length, 10), color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your saree collection</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/admin/upload')}
              className="bg-gradient-to-br from-primary to-cyan-600 text-white p-8 rounded-2xl hover:shadow-xl transition-all group"
            >
              <Upload className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">Upload New Product</h3>
              <p className="text-cyan-100">Add a new saree to your collection</p>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-8 rounded-2xl hover:shadow-xl transition-all group"
            >
              <Package className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-2">View All Products</h3>
              <p className="text-pink-100">Browse and manage existing products</p>
            </button>
          </div>
        </motion.div>

        {/* Product Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-md mt-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
            <button
              onClick={() => setShowDeleteSection(!showDeleteSection)}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              {showDeleteSection ? 'Hide Delete Section' : 'Delete Products'}
            </button>
          </div>

          {showDeleteSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Filter Products</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id || cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price (₹)</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price (₹)</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="50000"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="mt-4 text-primary hover:text-teal-700 font-semibold transition-colors"
                >
                  Reset Filters
                </button>
              </div>

              {/* Product List */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Products ({filteredProducts.length})
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSelectAll}
                      className="text-primary hover:text-teal-700 font-semibold transition-colors"
                    >
                      {selectedProducts.length === filteredProducts.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                    {selectedProducts.length > 0 && (
                      <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete Selected ({selectedProducts.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No products match your filters
                    </p>
                  ) : (
                    filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-4 bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          className="w-5 h-5 text-primary focus:ring-primary rounded"
                        />
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.categoryName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">₹{product.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{product.material}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Confirm Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Confirm Deletion
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete {selectedProducts.length} product(s)?
                  </p>
                </div>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-semibold">
                  ⚠️ This action cannot be undone
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
