import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageData, QuadrantImage } from '@/types/image-types';
import { processImageFile, validateImageAspectRatio, splitImageIntoQuadrants } from '@/utils/image-processor';
import { useToast } from '@/hooks/use-toast';

interface MainImageUploaderProps {
  onImageProcessed: (imageData: ImageData, quadrants: QuadrantImage[]) => void;
  onNext: () => void;
  mainImage?: ImageData;
  quadrants?: QuadrantImage[];
}

export default function MainImageUploader({
  onImageProcessed,
  onNext,
  mainImage,
  quadrants
}: MainImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, JPEG)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validate aspect ratio
      const isValidAspectRatio = await validateImageAspectRatio(file);
      if (!isValidAspectRatio) {
        toast({
          title: "Aspect ratio warning",
          description: "For best results, use a 16:9 aspect ratio image. We'll crop to fit.",
          variant: "default"
        });
      }

      // Process the image
      const imageData = await processImageFile(file);
      const imageQuadrants = await splitImageIntoQuadrants(imageData);
      
      onImageProcessed(imageData, imageQuadrants);
      
      toast({
        title: "Image processed successfully",
        description: "Your main image has been split into quadrants",
        variant: "default"
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onImageProcessed, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  const removeMainImage = () => {
    onImageProcessed(undefined as any, []);
  };

  const handleNext = () => {
    if (!mainImage || !quadrants?.length) {
      toast({
        title: "Main image required",
        description: "Please upload a main image before proceeding",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Main Image</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This image will be split into 4 quadrants to create the expandable tile effect.
          Choose a high-quality 16:9 image (1214×683px recommended).
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {!mainImage ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cloud-upload-alt text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isDragActive ? "Drop your image here" : "Drop your main image here"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                PNG, JPG up to 10MB • 16:9 aspect ratio preferred
              </p>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>Choose File
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Image Preview */}
            <div className="mt-6">
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Main Image Preview</h4>
                  <button
                    onClick={removeMainImage}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                  >
                    <i className="fas fa-trash mr-1"></i>Remove
                  </button>
                </div>
                <img
                  src={mainImage.src}
                  alt="Main image preview"
                  className="w-full h-auto rounded-lg shadow-sm"
                />
                <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                  <span>{mainImage.name}</span>
                  <span>{mainImage.dimensions}</span>
                </div>
              </div>
            </div>

            {/* Quadrant Preview */}
            {quadrants && quadrants.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Main Image Split Preview</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quadrants.map((quadrant, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                      <img
                        src={URL.createObjectURL(quadrant.blob)}
                        alt={`${quadrant.name} quadrant`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-90">
                        <span className="text-xs font-medium text-gray-700">{quadrant.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
          disabled={!mainImage || !quadrants?.length || isProcessing}
        >
          Next: Surrounding Images
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
