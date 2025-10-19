import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { fetchProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import { Slider } from '@mui/material'

const Products = () => {
  const { category } = useParams()
  const [filtered, setFiltered] = useState([]) // Filtered products state
  const [activeCategory, setActiveCategory] = useState(category || 'all') // Active category state
  const [priceRange, setPriceRange] = useState([0, 1000]) // Default price range
  const [sortOrder, setSortOrder] = useState('asc') // Default to ascending order

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  // Effect to set price range only once when products are fetched
  useEffect(() => {
    if (products.length > 0) {
      // Dynamically calculate the max price from products only once
      const maxPrice = Math.max(...products.map(product => product.price))

      if (priceRange[1] !== maxPrice) {
        setPriceRange([0, maxPrice])
      }

      // Filter products based on price range and category
      let filteredProducts = products.filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      )

      // Filter by category if applicable
      if (category && category !== 'all') {
        setActiveCategory(category)
        filteredProducts = filteredProducts.filter(
          (p) => p.category?.slug?.toLowerCase() === category.toLowerCase()
        )
      }

      // Sort by price if needed
      if (sortOrder === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price)
      } else if (sortOrder === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price)
      }

      // Update filtered state with the filtered products
      setFiltered(filteredProducts)
    }
  }, [products, category, priceRange, sortOrder]) // Dependencies: products, category, priceRange, sortOrder

  // Handle category filter change
  const handleFilter = (catSlug) => {
    setActiveCategory(catSlug)
    if (catSlug === 'all') {
      setFiltered(products)
    } else {
      setFiltered(products.filter((p) => p.category?.slug === catSlug))
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
          .filter((p) => p.category)
          .map((p) => [p.category._id, p.category])
      ).values()
    ).map((cat) => ({
      id: cat._id,
      slug: cat.slug,
      name: cat.name,
    })),
  ]

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Collection</h1>
          <p className="text-lg text-gray-600">Explore our curated selection of beautiful sarees</p>
        </motion.div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-6 mb-8 overflow-x-auto pb-4">
          <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
          {categories.map((cat) => (
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

          {/* Sort by Price Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-6 py-2 rounded-full font-semibold bg-gray-200 text-gray-700"
          >
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter by Price</h3>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `₹${value}`} // Indian currency format
            min={0}
            max={Math.max(...products.map((product) => product.price))} // Dynamically calculated max price
            step={10}
            className="w-full"
          />
          <div className="flex justify-between mt-4">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
