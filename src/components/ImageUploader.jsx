import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, X, Star } from 'lucide-react'

const ImageUploader = ({ images, setImages, mainImageIndex, setMainImageIndex }) => {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // 🧠 Handle file selection (both upload & camera)
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Store actual File objects and also preview URLs
    const filePreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setImages(prev => [...prev, ...filePreviews])
  }

  // 🧹 Remove image
  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImgs = prev.filter((_, i) => i !== index)
      if (mainImageIndex >= index && mainImageIndex > 0) {
        setMainImageIndex(mainImageIndex - 1)
      }
      return newImgs
    })
  }

  // ⭐ Set main image
  const handleSetMain = (index) => {
    setMainImageIndex(index)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Product Images
      </label>

      {/* Upload buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 text-center">Choose from device</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </button>

        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors"
        >
          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 text-center">Take photo</p>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </button>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-lg overflow-hidden group"
            >
              <img
                src={img.preview}
                alt={`Product ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Hover overlay for actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Set main */}
                <button
                  type="button"
                  onClick={() => handleSetMain(idx)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    mainImageIndex === idx ? 'bg-yellow-500' : 'bg-white/90 hover:bg-white'
                  }`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      mainImageIndex === idx ? 'text-white fill-current' : 'text-gray-700'
                    }`}
                  />
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Main image label */}
              {mainImageIndex === idx && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Main
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        {images.length === 0
          ? 'No images uploaded yet'
          : `${images.length} image(s) selected • Click star to set main image`}
      </p>
    </div>
  )
}

export default ImageUploader
