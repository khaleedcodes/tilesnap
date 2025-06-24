import { StepNumber } from '@/types/image-types';

interface StepIndicatorProps {
  currentStep: StepNumber;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: 'Upload Main Image', icon: '🖼️', description: 'Choose your 16:9 main image' },
    { number: 2, title: 'Add Surrounding Images', icon: '🎨', description: 'Upload 8 complementary images' },
    { number: 3, title: 'Download Results', icon: '📱', description: 'Get your Twitter-ready tiles' }
  ];

  const progressWidth = (currentStep / 3) * 100;

  return (
    <div className="mb-8">
      <div className="cartoon-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center space-x-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-3 border-black transition-all duration-300 ${
                    step.number <= currentStep
                      ? 'gradient-primary text-white shadow-lg'
                      : 'bg-white text-gray-500'
                  } ${step.number === currentStep ? 'bounce-in pulse-glow' : ''}`}
                >
                  {step.number < currentStep ? '✓' : step.icon}
                </div>
                <div className="hidden sm:block">
                  <span
                    className={`text-sm font-bold cartoon-text ${
                      step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    step.number < currentStep ? 'gradient-primary' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="cartoon-text text-sm font-bold gradient-accent px-3 py-1 rounded-full border-2 border-black">
            Step {currentStep} of 3
          </div>
        </div>
        
        {/* Mobile step info */}
        <div className="sm:hidden text-center mb-4">
          <h3 className="text-lg font-bold cartoon-text text-gray-900">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-sm text-gray-600">
            {steps[currentStep - 1].description}
          </p>
        </div>
        
        <div className="w-full bg-gray-300 rounded-full h-3 border-2 border-black">
          <div
            className="gradient-primary h-full rounded-full transition-all duration-500 border-r-2 border-black"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
