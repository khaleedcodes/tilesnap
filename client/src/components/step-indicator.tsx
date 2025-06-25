import { motion } from "framer-motion";
import { StepNumber } from "@/types/image-types";
import {
  staggerContainer,
  staggerItem,
  progressVariants,
  bounceVariants,
  createAccessibleVariants,
} from "@/lib/animations";

interface StepIndicatorProps {
  currentStep: StepNumber;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    {
      number: 1,
      title: "Upload Main Image",
      icon: "🖼️",
      description: "Choose your 16:9 main image",
    },
    {
      number: 2,
      title: "Add Surrounding Images",
      icon: "🎨",
      description: "Upload 8 complementary images",
    },
    {
      number: 3,
      title: "Download Results",
      icon: "📱",
      description: "Get your Twitter-ready tiles",
    },
  ];

  const progressWidth = (currentStep / 3) * 100;

  return (
    <motion.div
      className="mb-4 sm:mb-8"
      variants={createAccessibleVariants(staggerContainer)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="cartoon-card"
        variants={createAccessibleVariants(staggerItem)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <motion.div
            className="flex items-center space-x-3 sm:space-x-6 overflow-x-auto pb-2 sm:pb-0"
            variants={createAccessibleVariants(staggerContainer)}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0"
                variants={createAccessibleVariants(staggerItem)}
              >
                <motion.div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold border-2 sm:border-3 border-black transition-all duration-300 ${
                    step.number <= currentStep
                      ? "gradient-primary text-white shadow-lg"
                      : "bg-white text-gray-500"
                  }`}
                  variants={
                    step.number === currentStep
                      ? createAccessibleVariants(bounceVariants)
                      : undefined
                  }
                  animate={step.number === currentStep ? "bounce" : "initial"}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step.number < currentStep ? "✓" : step.icon}
                </motion.div>
                <div className="hidden lg:block">
                  <motion.span
                    className={`text-sm font-bold cartoon-text ${
                      step.number <= currentStep
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                    animate={
                      step.number === currentStep ? { scale: [1, 1.05, 1] } : {}
                    }
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    {step.title}
                  </motion.span>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <motion.div
                    className={`w-6 sm:w-12 h-1 rounded-full transition-all duration-300 ${
                      step.number < currentStep
                        ? "gradient-primary"
                        : "bg-gray-300"
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: step.number < currentStep ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="cartoon-text text-xs sm:text-sm font-bold gradient-accent px-2 sm:px-3 py-1 rounded-full border-2 border-black mt-2 sm:mt-0 self-center sm:self-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Step {currentStep} of 3
          </motion.div>
        </div>

        {/* Mobile step info */}
        <motion.div
          className="lg:hidden text-center mb-4"
          variants={createAccessibleVariants(staggerItem)}
        >
          <motion.h3
            className="text-base sm:text-lg font-bold cartoon-text text-gray-900"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {steps[currentStep - 1].title}
          </motion.h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </motion.div>

        <div className="w-full bg-gray-300 rounded-full h-3 border-2 border-black overflow-hidden">
          <motion.div
            className="gradient-primary h-full rounded-full border-r-2 border-black"
            variants={createAccessibleVariants(progressVariants)}
            initial="initial"
            animate="animate"
            custom={progressWidth}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
