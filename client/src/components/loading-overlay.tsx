import { motion, AnimatePresence } from "framer-motion";
import {
  backdropVariants,
  loadingVariants,
  createAccessibleVariants,
} from "@/lib/animations";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  isVisible,
  message = "Processing Images...",
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          variants={createAccessibleVariants(backdropVariants)}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="cartoon-card max-w-sm w-full mx-4 text-center"
            variants={createAccessibleVariants(loadingVariants)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="mb-6">
              <motion.div
                className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.h3
              className="text-xl font-bold cartoon-text text-gray-900 mb-3"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Processing
            </motion.h3>
            <motion.p
              className="text-gray-700 text-lg"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {message}
            </motion.p>
            <p className="text-gray-600 text-sm mt-2">
              Please wait while we prepare your Twitter tiles
            </p>

            {/* Animated dots */}
            <motion.div
              className="flex justify-center space-x-1 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
