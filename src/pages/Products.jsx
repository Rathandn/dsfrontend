import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { fetchProducts } from '../api/products'
import ProductCard from '../components/ProductCard'

const Products = () => {
  const { category } = useParams()
  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState(category || 'all')

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  useEffect(() => {
    if (products.length > 0) {
      if (category && category !== 'all') {
        setActiveCategory(category)
        setFiltered(
          products.filter(p => p.category?.slug?.toLowerCase() === category.toLowerCase())
        )
      } else {
        setFiltered(products)
      }
    }
  }, [category, products])

  const handleFilter = (catSlug) => {
    setActiveCategory(catSlug)
    if (catSlug === 'all') {
      setFiltered(products)
    } else {
      setFiltered(products.filter(p => p.category?.slug === catSlug))
    }
  }

  if (isLoading) return <p className="text-center mt-10 text-gray-500">Loading products...</p>
  if (error) return <p className="text-center mt-10 text-red-500">Failed to load products</p>

  // Build category list dynamically
  const categories = [
    { id: 'all', slug: 'all', name: 'All' },
    ...Array.from(
      new Map(
        products
          .filter(p => p.category)
          .map(p => [p.category._id, p.category])
      ).values()
    ).map(cat => ({
      id: cat._id,
      slug: cat.slug,
      name: cat.name,
    })),
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Collection</h1>
          <p className="text-lg text-gray-600">Explore our curated selection of beautiful sarees</p>
        </motion.div>

        {/* Filter buttons */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-4">
          <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleFilter(cat.slug)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.slug
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((product, idx) => (
            <ProductCard key={product._id} product={product} index={idx} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No products found in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
