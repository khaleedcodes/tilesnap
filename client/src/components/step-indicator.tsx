import { StepNumber } from '@/types/image-types';

interface StepIndicatorProps {
  currentStep: StepNumber;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { number: 1, title: 'Upload Main Image' },
    { number: 2, title: 'Surrounding Images' },
    { number: 3, title: 'Preview & Export' }
  ];

  const progressWidth = (currentStep / 3) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.number <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-sm font-medium ${
                  step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-200 ml-2"></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Step {currentStep} of 3
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>
    </div>
  );
}
