interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingOverlay({ isVisible, message = "Processing Images..." }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="cartoon-card max-w-sm w-full mx-4 text-center bounce-in">
        <div className="mb-6">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h3 className="text-xl font-bold cartoon-text text-gray-900 mb-3">Processing</h3>
        <p className="text-gray-700 text-lg">{message}</p>
        <p className="text-gray-600 text-sm mt-2">Please wait while we prepare your Twitter tiles</p>
      </div>
    </div>
  );
}
