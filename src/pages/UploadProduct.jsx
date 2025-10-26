import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Loader2, LoaderCircle, LoaderIcon } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import API from '../api/axiosInstance'
import { useQuery } from '@tanstack/react-query'
import Loader from '../components/Loader'
import { useTemplates, useCreateTemplate } from '../hooks/useTemplates'
import { useCategories } from '../hooks/useCategories'

const UploadProduct = () => {
  const navigate = useNavigate()

  // hooks
  const { data: templates = [], refetch: refetchTemplates, isLoading: isTemplatesLoading } = useTemplates()
  const createTemplate = useCreateTemplate()
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()

  // form state
  const [formData, setFormData] = useState({
    templateName: '',
    name: '',
    category: '',
    price: '',
    description: '',
    material: '',
    color: '',
  })

  const [images, setImages] = useState([])
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // UI / network states
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingTemplate, setIsSavingTemplate] = useState(false)
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // admin auth guard
  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth')
    if (!isAuth) navigate('/admin-login')
  }, [navigate])

  // when a template is selected, autofill fields (but keep images empty)
  useEffect(() => {
    if (!selectedTemplate) return

    const t = templates.find((x) => x._id === selectedTemplate)
    if (!t) return

    setFormData((prev) => ({
      ...prev,
      name: t.name || '',
      category: t.category?._id || '',
      price: t.price || '',
      description: t.description || '',
      material: t.material || '',
      color: t.color || '',
    }))
    setImages([])
    setMainImageIndex(0)
  }, [selectedTemplate, templates])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (files) => {
    // ImageUploader returns an array of { file, preview } objects
    setImages(files)
  }

  // Upload product
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isUploading) return

    if (!images || images.length === 0) {
      alert('Please upload at least one image')
      return
    }

    setIsUploading(true)
    setError('')
    try {
      const form = new FormData()
      // append textual fields
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, v)
      })
      // append files
      images.forEach((img) => form.append('images', img.file))
      // main image index
      form.append('mainImageIndex', mainImageIndex)

      const res = await API.post('/products', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-key': 'SAREE_ADMIN_2024',
        },
      })

      console.log('Uploaded product', res.data)
      setSuccess(true)
      // small delay for success UI
      setTimeout(() => navigate('/admin'), 1500)
    } catch (err) {
      console.error('Upload failed', err)
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  // Save current form as template
  const handleTemplateSave = async (e) => {
    e.preventDefault()
    if (isSavingTemplate) return
    if (!formData.templateName || !formData.name || !formData.category || !formData.price) {
      alert('Please provide Template Name, Product Name, Category and Price before saving a template.')
      return
    }

    setIsSavingTemplate(true)
    setError('')
    try {
      // create payload - ensure numeric price and productName field
      const payload = {
        templateName: formData.templateName,
        name: formData.name,
        productName: formData.name, // backend expects productName
        category: formData.category,
        price: Number(formData.price),
        description: formData.description,
        material: formData.material,
        color: formData.color,
      }

      // use createTemplate hook (it will POST to /product-templates)
      createTemplate.mutate(payload, {
        onSuccess: () => {
          alert('✅ Template saved')
          setFormData((prev) => ({ ...prev, templateName: '' }))
          refetchTemplates()
        },
        onError: (err) => {
          console.error('Save template failed', err)
          alert('❌ Failed to save template')
        },
        onSettled: () => {
          setIsSavingTemplate(false)
        },
      })
    } catch (err) {
      console.error(err)
      setIsSavingTemplate(false)
      alert('❌ Failed to save template')
    }
  }

  // Delete selected template
  const handleDeleteTemplate = async () => {
    if (isDeletingTemplate) return
    if (!selectedTemplate) {
      alert('Select a template to delete')
      return
    }
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      setIsDeletingTemplate(true)
      await API.delete(`/product-templates/${selectedTemplate}`, {
        headers: { 'x-admin-key': 'SAREE_ADMIN_2024' },
      })
      alert('🗑️ Template deleted')
      setSelectedTemplate('')
      refetchTemplates()
    } catch (err) {
      console.error('Delete failed', err)
      alert('❌ Failed to delete template')
    } finally {
      setIsDeletingTemplate(false)
    }
  }

 if (isTemplatesLoading || isCategoriesLoading)
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin w-8 h-8 text-primary" />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Upload New Product</h1>

          {/* Template controls */}
          <div className="grid md:grid-cols-3 gap-4 mb-6 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">— None —</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.templateName} ({t.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleDeleteTemplate}
                disabled={isDeletingTemplate}
                className={`px-4 py-2 rounded-lg text-white ${isDeletingTemplate ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {isDeletingTemplate ? 'Deleting...' : 'Delete Template'}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Name (for saving) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
              <input
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleChange}
                placeholder="Template label (e.g. Soft Silk Base)"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
              />
            </div>

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

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Category</label>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/categories')}
                    className="text-xs text-primary hover:text-teal-700 font-semibold underline transition-colors"
                  >
                    Manage Categories
                  </button>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
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
                />
              </div>

              {/* Color */}
              {/* Color */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
  <select
    name="color"
    value={formData.color}
    onChange={handleChange}
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
    required
  >
    <option value="">Select Color</option>
    {[
      'Red',
      'Maroon',
      'Pink',
      'Orange',
      'Yellow',
      'Green',
      'Blue',
      'Navy Blue',
      'Purple',
      'Violet',
      'Gold',
      'Silver',
      'Black',
      'White',
      'Cream',
      'Beige',
    ].map((color) => (
      <option key={color} value={color.toLowerCase()}>
        {color}
      </option>
    ))}
  </select>
</div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
                />
              </div> */}
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
              />
            </div>

            {/* Image Uploader component (camera + files + visual main image select) */}
            <ImageUploader
              images={images}
              setImages={handleFileChange}
              mainImageIndex={mainImageIndex}
              setMainImageIndex={setMainImageIndex}
            />

            {/* Success / Error */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3"
              >
                <Check className="w-5 h-5" />
                Product uploaded successfully! Redirecting...
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-700 px-6 py-4 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Buttons row */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                type="submit"
                disabled={isUploading}
                className={`w-full md:w-auto px-6 py-3 rounded-lg text-white font-semibold transition ${
                  isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-teal-700'
                }`}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Uploading...
                  </span>
                ) : (
                  'Upload Product'
                )}
              </button>

              <button
                type="button"
                onClick={handleTemplateSave}
                disabled={isSavingTemplate}
                className={`px-6 py-3 rounded-lg text-white font-semibold transition ${
                  isSavingTemplate ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSavingTemplate ? 'Saving...' : 'Save as Template'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default UploadProduct

// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { ArrowLeft, Check, Loader2 } from 'lucide-react'
// import ImageUploader from '../components/ImageUploader'
// import API from '../api/axiosInstance'
// import { useQuery } from '@tanstack/react-query'

// const UploadProduct = () => {
//   const navigate = useNavigate()
//   const [formData, setFormData] = useState({
//     name: '',
//     category: '', // will store category _id
//     price: '',
//     description: '',
//     material: '',
//     color: '',
//   })
//   const [images, setImages] = useState([])
//   const [mainImageIndex, setMainImageIndex] = useState(0)
//   const [success, setSuccess] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   // ✅ Fetch categories from new Category collection
//   const { data: categories = [], isLoading } = useQuery({
//     queryKey: ['categories'],
//     queryFn: async () => {
//       const { data } = await API.get('/categories')
//       return data
//     },
//   })

//   // ✅ Admin authentication check
//   useEffect(() => {
//     const isAuth = localStorage.getItem('adminAuth')
//     if (!isAuth) navigate('/admin-login')
//   }, [navigate])

//   // ✅ Handle form input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData({ ...formData, [name]: value })
//   }

//   // ✅ Submit to backend
//  const handleSubmit = async (e) => {
//   e.preventDefault()

//   if (images.length === 0) {
//     alert('Please upload at least one image')
//     return
//   }

//   try {
//     setLoading(true)
//     setError('')

//     const form = new FormData()
//     Object.entries(formData).forEach(([key, value]) => form.append(key, value))

//     // ✅ Append all selected images
//     images.forEach((img) => form.append('images', img.file))

//     // ✅ Append main image URL (based on index)
//     const mainImageFile = images[mainImageIndex]?.file
//     if (mainImageFile) {
//       form.append('mainImageIndex', mainImageIndex)
//     }

//     // ✅ Send form data to backend
//     const res = await API.post('/products', form, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//         'x-admin-key': 'SAREE_ADMIN_2024',
//       },
//     })

//     console.log('✅ Uploaded product:', res.data)
//     setSuccess(true)
//     setTimeout(() => navigate('/admin'), 2000)
//   } catch (err) {
//     console.error('❌ Upload failed:', err)
//     setError(err.response?.data?.message || 'Upload failed')
//   } finally {
//     setLoading(false)
//   }
// }


//   return (
//     <div className="min-h-screen pt-24 pb-16 px-4 bg-gray-50">
//       <div className="max-w-4xl mx-auto">
//         <button
//           onClick={() => navigate('/admin')}
//           className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to Dashboard
//         </button>

//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow-md p-8"
//         >
//           <h1 className="text-3xl font-bold text-gray-800 mb-8">Upload New Product</h1>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid md:grid-cols-2 gap-6">
//               {/* Product Name */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
//                   required
//                 />
//               </div>

//               {/* Category Dropdown with Manage Link */}
//               <div>
//                 <div className="flex items-center justify-between mb-2">
//                   <label className="block text-sm font-semibold text-gray-700">Category</label>
//                   <button
//                     type="button"
//                     onClick={() => navigate('/admin/categories')}
//                     className="text-xs text-primary hover:text-teal-700 font-semibold underline transition-colors"
//                   >
//                     Manage Categories
//                   </button>
//                 </div>
//                 {isLoading ? (
//                   <p className="text-gray-500">Loading categories...</p>
//                 ) : (
//                   <select
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>

//               {/* Price */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
//                 <input
//                   type="number"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
//                   required
//                 />
//               </div>

//               {/* Material */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
//                 <input
//                   type="text"
//                   name="material"
//                   value={formData.material}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
//                   required
//                 />
//               </div>

//               {/* Color */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
//                 <input
//                   type="text"
//                   name="color"
//                   value={formData.color}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 rows={4}
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors"
//                 required
//               />
//             </div>

//             {/* Image Upload Section */}
//             <ImageUploader
//               images={images}
//               setImages={setImages}
//               mainImageIndex={mainImageIndex}
//               setMainImageIndex={setMainImageIndex}
//             />

//             {/* Success / Error Messages */}
//             {success && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-green-50 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3"
//               >
//                 <Check className="w-5 h-5" />
//                 Product uploaded successfully! Redirecting...
//               </motion.div>
//             )}

//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-red-50 text-red-700 px-6 py-4 rounded-lg"
//               >
//                 {error}
//               </motion.div>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex justify-center items-center gap-2"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin w-5 h-5" /> Uploading...
//                 </>
//               ) : (
//                 'Upload Product'
//               )}
//             </button>
//           </form>
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// export default UploadProduct