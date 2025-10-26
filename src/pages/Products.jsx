import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { fetchProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import { Slider } from '@mui/material'

const Products = () => {
  const { category } = useParams()
  const navigate = useNavigate()

  const [filtered, setFiltered] = useState([])
  const [activeCategory, setActiveCategory] = useState(category || 'all')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [sortOrder, setSortOrder] = useState('asc')
  const [showSkeleton, setShowSkeleton] = useState(true)

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  // Add a small delay so shimmer is visible even if fast
  useEffect(() => {
    if (isLoading) {
      setShowSkeleton(true)
    } else {
      const t = setTimeout(() => setShowSkeleton(false), 300)
      return () => clearTimeout(t)
    }
  }, [isLoading])

  // Set max price and filter
  useEffect(() => {
    if (!products.length) return

    let categoryFiltered = [...products]
    if (category && category !== 'all') {
      categoryFiltered = categoryFiltered.filter(
        (p) => p.category?.slug?.toLowerCase() === category.toLowerCase()
      )
    }

    const computedMax = Math.max(...categoryFiltered.map((p) => p.price), 0)
    setMaxPrice(computedMax)
    setPriceRange([0, computedMax])
  }, [products, category])

  useEffect(() => {
    if (!products.length) return

    let updated = [...products]
    if (category && category !== 'all') {
      setActiveCategory(category)
      updated = updated.filter(
        (p) => p.category?.slug?.toLowerCase() === category.toLowerCase()
      )
    }

    updated = updated.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    )

    updated.sort((a, b) =>
      sortOrder === 'asc' ? a.price - b.price : b.price - a.price
    )

    setFiltered(updated)
  }, [products, category, priceRange, sortOrder])

  const handleFilter = (catSlug) => {
    setActiveCategory(catSlug)
    navigate(`/products/${catSlug}`)
  }

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

  if (error)
    return <p className="text-center mt-10 text-red-500">Failed to load products</p>

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Our Collection
          </h1>
          <p className="text-lg text-gray-600">
            Explore our curated selection of beautiful sarees
          </p>
        </motion.div>

        {/* Filter Controls */}
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

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-6 py-2 rounded-full font-semibold bg-gray-200 text-gray-700"
          >
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        {/* Price Filter */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Filter by Price
          </h3>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `₹${value}`}
            min={0}
            max={maxPrice}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between mt-4">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>

        {/* Product Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {showSkeleton
            ? [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-md overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
                    <div className="h-6 bg-gray-300 rounded w-3/4 animate-shimmer"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-shimmer"></div>
                  </div>
                </div>
              ))
            : filtered.map((product, idx) => (
                <ProductCard key={product._id} product={product} index={idx} />
              ))}
        </motion.div>

        {!showSkeleton && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">
              No products found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products


// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { motion } from 'framer-motion'
// import { Filter } from 'lucide-react'
// import { fetchProducts } from '../api/products'
// import ProductCard from '../components/ProductCard'
// import { Slider } from '@mui/material'
// import Loader from '../components/loader'

// const Products = () => {
//   const { category } = useParams()
//   const navigate = useNavigate()

//   const [filtered, setFiltered] = useState([])
//   const [activeCategory, setActiveCategory] = useState(category || 'all')
//   const [priceRange, setPriceRange] = useState([0, 1000])
//   const [maxPrice, setMaxPrice] = useState(1000)
//   const [sortOrder, setSortOrder] = useState('asc')

//   const { data: products = [], isLoading, error } = useQuery({
//     queryKey: ['products'],
//     queryFn: fetchProducts,
//   })

//   // 🔧 Recalculate maxPrice and reset priceRange when category changes
//   useEffect(() => {
//     if (!products.length) return

//     let categoryFiltered = [...products]

//     if (category && category !== 'all') {
//       categoryFiltered = categoryFiltered.filter(
//         (p) => p.category?.slug?.toLowerCase() === category.toLowerCase()
//       )
//     }

//     const computedMax = Math.max(...categoryFiltered.map((p) => p.price), 0)
//     setMaxPrice(computedMax)

//     // ✅ Reset price range to full range of current category
//     setPriceRange([0, computedMax])
//   }, [products, category])

//   // 🔁 Filter products when dependencies change
//   useEffect(() => {
//     if (!products.length) return

//     let updated = [...products]

//     if (category && category !== 'all') {
//       setActiveCategory(category)
//       updated = updated.filter(
//         (p) => p.category?.slug?.toLowerCase() === category.toLowerCase()
//       )
//     }

//     updated = updated.filter(
//       (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
//     )

//     if (sortOrder === 'asc') {
//       updated.sort((a, b) => a.price - b.price)
//     } else {
//       updated.sort((a, b) => b.price - a.price)
//     }

//     setFiltered(updated)
//   }, [products, category, priceRange, sortOrder])

//   // 🧭 Handle category filter button
//   const handleFilter = (catSlug) => {
//     setActiveCategory(catSlug)
//     navigate(`/products/${catSlug}`)
//   }

//   // 🧾 Build category list
//   const categories = [
//     { id: 'all', slug: 'all', name: 'All' },
//     ...Array.from(
//       new Map(
//         products
//           .filter((p) => p.category)
//           .map((p) => [p.category._id, p.category])
//       ).values()
//     ).map((cat) => ({
//       id: cat._id,
//       slug: cat.slug,
//       name: cat.name,
//     })),
//   ]

//   if (isLoading) return <p className="text-center mt-10 text-gray-500"><Loader/></p>
//   if (error) return <p className="text-center mt-10 text-red-500">Failed to load products</p>

//   return (
//     <div className="min-h-screen pt-24 pb-16 px-4">
//       <div className="max-w-7xl mx-auto">
//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Our Collection</h1>
//           <p className="text-lg text-gray-600">Explore our curated selection of beautiful sarees</p>
//         </motion.div>

//         {/* Filter and Sort Controls */}
//         <div className="flex items-center gap-6 mb-8 overflow-x-auto pb-4">
//           <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
//           {categories.map((cat) => (
//             <button
//               key={cat.id}
//               onClick={() => handleFilter(cat.slug)}
//               className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
//                 activeCategory === cat.slug
//                   ? 'bg-primary text-white'
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               {cat.name}
//             </button>
//           ))}

//           {/* Sort by Price Dropdown */}
//           <select
//             value={sortOrder}
//             onChange={(e) => setSortOrder(e.target.value)}
//             className="px-6 py-2 rounded-full font-semibold bg-gray-200 text-gray-700"
//           >
//             <option value="asc">Price: Low to High</option>
//             <option value="desc">Price: High to Low</option>
//           </select>
//         </div>

//         {/* Price Range Filter */}
//         <div className="mb-8">
//           <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter by Price</h3>
//           <Slider
//             value={priceRange}
//             onChange={(e, newValue) => setPriceRange(newValue)}
//             valueLabelDisplay="auto"
//             valueLabelFormat={(value) => `₹${value}`}
//             min={0}
//             max={maxPrice}
//             step={10}
//             className="w-full"
//           />
//           <div className="flex justify-between mt-4">
//             <span>₹{priceRange[0]}</span>
//             <span>₹{priceRange[1]}</span>
//           </div>
//         </div>

//         {/* Product Grid */}
//         <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filtered.map((product, idx) => (
//             <ProductCard key={product._id} product={product} index={idx} />
//           ))}
//         </motion.div>

//         {filtered.length === 0 && (
//           <div className="text-center py-20">
//             <p className="text-xl text-gray-500">No products found in this category</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Products
