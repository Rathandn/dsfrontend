import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import UploadProduct from './pages/UploadProduct'
import AdminCategories from './pages/AdminCategories'

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:category" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/upload" element={<UploadProduct />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
