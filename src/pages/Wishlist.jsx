import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getWishlist, removeFromWishlist } from '../utils/wishlistUtils'

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setWishlist(getWishlist())
  }, [])

  const handleRemove = (id) => {
    removeFromWishlist(id)
    setWishlist(getWishlist()) // refresh state
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-10 h-10 text-red-500 fill-current" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">My Wishlist</h1>
          </div>
          <p className="text-lg text-gray-600">Your favorite sarees saved for later</p>
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Start adding your favorite sarees to your wishlist</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  onClick={() => navigate(`/product/${item._id}`)}
                  className="cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.mainImage}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 mb-1">{item.categoryName}</p>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                    <p className="text-xl font-bold text-primary">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => handleRemove(item._id)} // ✅ fixed here
                    className="w-full bg-red-50 text-red-600 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
