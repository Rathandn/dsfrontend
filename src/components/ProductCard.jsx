import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/wishlistUtils'

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate()
  const [inWishlist, setInWishlist] = useState(false)

  const productId = product._id // ✅ Always use MongoDB _id

  useEffect(() => {
    setInWishlist(isInWishlist(productId))
  }, [productId])

  const handleWishlist = (e) => {
    e.stopPropagation()
    if (inWishlist) {
      removeFromWishlist(productId)
      setInWishlist(false)
    } else {
      addToWishlist(product)
      setInWishlist(true)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/product/${productId}`)} // ✅ Corrected route
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow group"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleWishlist}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
        </motion.button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-1">
          {product.category?.name || product.categoryName || 'Uncategorized'}
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xl font-bold text-primary">
          ₹{product.price?.toLocaleString() ?? 0}
        </p>
      </div>
    </motion.div>
  )
}

export default ProductCard
