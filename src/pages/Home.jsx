import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Heart, ShoppingBag } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import Loader from '../components/loader'

const Home = () => {
  const navigate = useNavigate()
  const { data: categories = [], isLoading } = useCategories()

  const features = [
    { icon: Sparkles, title: 'Premium Quality', desc: 'Handpicked authentic sarees' },
    { icon: Heart, title: 'Save Favorites', desc: 'Create your wishlist' },
    { icon: ShoppingBag, title: 'Wide Collection', desc: 'Multiple categories available' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920')] bg-cover bg-center opacity-20" />
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="relative z-10 text-center px-4 max-w-4xl"
  >
    <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
      Elegance in Every Thread
    </h1>
    <p className="text-lg md:text-xl text-gray-700 mb-8">
      Discover our exquisite collection of traditional and contemporary sarees
    </p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate('/products')}
      className="bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 mx-auto hover:bg-teal-700 transition-colors"
    >
      Explore Collection
      <ArrowRight className="w-5 h-5" />
    </motion.button>
  </motion.div>
</section>


      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-gray-800 mb-16"
          >
            Why Choose Us
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center text-gray-800 mb-16"
          >
            Shop by Category
          </motion.h2>

          {isLoading ? (
  // 🧩 Skeleton shimmer placeholders
  <div className="grid md:grid-cols-3 gap-8">
    {[...Array(6)].map((_, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: idx * 0.1 }}
        className="relative h-80 rounded-2xl overflow-hidden bg-gray-200 animate-pulse"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      </motion.div>
    ))}
  </div>
) : (
  <div className="grid md:grid-cols-3 gap-8">
    {categories.map((cat, idx) => (
      <motion.div
        key={cat._id || cat.id}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.1 }}
        onClick={() => navigate(`/products/${cat.slug}`)}
        className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group bg-gray-100"
      >
        {/* ✅ Smooth fade-in image with fallback */}
        <img
          src={cat.image || '/placeholder.jpg'}
          alt={cat.name}
          loading="lazy"
          onError={(e) => (e.target.src = '/placeholder.jpg')}
          className="w-full h-full object-cover opacity-0 transition-all duration-700 ease-in-out group-hover:scale-110"
          onLoad={(e) => (e.target.style.opacity = 1)}
        />

        {/* Overlay with gradient and text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
            <p className="text-gray-200">{cat.count} Products</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
)}


          {/* {isLoading ? (
            <p className="text-center text-gray-500"><Loader/></p>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {categories.map((cat, idx) => (
                <motion.div
                  key={cat._id || cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(`/products/${cat.slug}`)}
                  className="relative h-80 rounded-2xl overflow-hidden cursor-pointer group"
                >
                {cat.image && cat.image !== "" ? (
  <img
    src={cat.image}
    alt={cat.name}
    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
  />
) : (
  <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div> // You can render a placeholder here
)}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                      <p className="text-gray-200">{cat.count} Products</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )} */}
        </div>
      </section>
    </div>
  )
}

export default Home
