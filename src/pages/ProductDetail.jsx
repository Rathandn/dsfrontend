import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/wishlistUtils'
import API from '../api/axiosInstance'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImage, setCurrentImage] = useState(0)
  const [inWishlist, setInWishlist] = useState(false)

  // 🧠 Fetch product by ID from backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data } = await API.get(`/products/${id}`)
        setProduct(data)
        setInWishlist(isInWishlist(data._id))
      } catch (err) {
        console.error('❌ Error fetching product:', err)
        setError('Failed to load product details.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  // ❤️ Wishlist toggle
  const handleWishlist = () => {
    if (!product) return
    if (inWishlist) {
      removeFromWishlist(product._id)
      setInWishlist(false)
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.price,
        mainImage: product.mainImage,
        categoryName: product.category?.name || product.categoryName,
      })
      setInWishlist(true)
    }
  }

  // Image carousel
  const nextImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setCurrentImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500 animate-pulse">Loading product...</p>
      </div>
    )

  if (error || !product)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-xl text-gray-500 mb-4">{error || 'Product not found'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* 🖼️ Product Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={product.images?.[currentImage]?.url || product.mainImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImage === idx ? 'border-primary scale-105' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* 🧾 Product Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                    {product.category?.name || product.categoryName || 'Uncategorized'}
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{product.name}</h1>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleWishlist}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    inWishlist ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
                </motion.button>
              </div>
              <p className="text-3xl font-bold text-primary">₹{product.price?.toLocaleString()}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Product Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-semibold text-gray-800">{product.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-semibold text-gray-800">{product.color}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6">
              <p className="text-gray-700 text-center">
                <strong>Note:</strong> Currently, we do not offer online delivery. Please add items to your wishlist and visit our store.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
