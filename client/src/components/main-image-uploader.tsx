import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageData, QuadrantImage } from '@/types/image-types';
import { processImageFile, validateImageAspectRatio, splitImageIntoQuadrants } from '@/utils/image-processor';
import { useToast } from '@/hooks/use-toast';
import ImageCropper from '@/components/image-cropper';

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
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState<ImageData | null>(null);
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
          description: "For best results, use a 16:9 aspect ratio image. You can crop to adjust.",
          variant: "default"
        });
      }

      // Process the image and show cropper
      const imageData = await processImageFile(file);
      setTempImageForCrop(imageData);
      setShowCropper(true);
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
  }, [toast]);

  const handleCropComplete = async (croppedImageData: ImageData) => {
    setIsProcessing(true);
    try {
      const imageQuadrants = await splitImageIntoQuadrants(croppedImageData);
      onImageProcessed(croppedImageData, imageQuadrants);
      
      toast({
        title: "Image processed successfully",
        description: "Your main image has been cropped and split into quadrants",
        variant: "default"
      });
    } catch (error) {
      console.error('Error processing cropped image:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process the cropped image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
    setTempImageForCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageForCrop(null);
    setIsProcessing(false);
  };

  const handleEditMainImage = () => {
    if (mainImage) {
      setTempImageForCrop(mainImage);
      setShowCropper(true);
    }
  };

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
    <div className="cartoon-card-hover">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold cartoon-text text-gray-900 mb-3">Upload Your Main Image 🖼️</h2>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          This image will be split into 4 quadrants to create the expandable tile effect.
          Choose a high-quality 16:9 image (1214×683px recommended).
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {!mainImage ? (
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 scale-105'
                : 'border-gray-400 hover:border-blue-400 hover:bg-blue-50'
            } border-black`}
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
                className="cartoon-button-primary px-6 py-3 disabled:opacity-50"
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
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEditMainImage}
                      className="text-blue-500 hover:text-blue-700 text-sm transition-colors"
                      title="Crop image"
                    >
                      <i className="fas fa-crop mr-1"></i>Crop
                    </button>
                    <button
                      onClick={removeMainImage}
                      className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      title="Remove image"
                    >
                      <i className="fas fa-trash mr-1"></i>Remove
                    </button>
                  </div>
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
          className="cartoon-button-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!mainImage || !quadrants?.length || isProcessing}
        >
          Next: Surrounding Images ➡️
        </button>
      </div>

      {tempImageForCrop && (
        <ImageCropper
          isOpen={showCropper}
          onClose={handleCropCancel}
          imageData={tempImageForCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
