import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-primary/5">
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            Curating Excellence
          </h2>
          <p className="text-muted-foreground">
            Unveiling our premium saree collection...
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Loader
