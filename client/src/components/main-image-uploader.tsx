import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { ImageData, QuadrantImage } from "@/types/image-types";
import {
  processImageFile,
  splitImageIntoQuadrants,
  TARGET_WIDTH,
  TARGET_HEIGHT,
} from "@/utils/image-processor";
import { useToast } from "@/hooks/use-toast";
import ImageCropper from "@/components/image-cropper";
import {
  staggerContainer,
  staggerItem,
  uploadVariants,
  buttonVariants,
  createAccessibleVariants,
} from "@/lib/animations";

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
  quadrants,
}: MainImageUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState<ImageData | null>(
    null
  );
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, JPEG)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      try {
        // Always show cropper for manual control
        const imageData = await processImageFile(file);
        setTempImageForCrop(imageData);
        setShowCropper(true);
      } catch (error) {
        console.error("Error processing image:", error);
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [toast]
  );

  // Handle crop completion
  const handleCropComplete = async (croppedImageData: ImageData) => {
    setShowCropper(false);
    setTempImageForCrop(null);
    setIsProcessing(true);

    try {
      // Process the cropped image to ensure it's the right size for quadrants
      const processedImageData = await resizeImageToTarget(croppedImageData);
      const quadrantsData = await splitImageIntoQuadrants(processedImageData);
      onImageProcessed(processedImageData, quadrantsData);

      toast({
        title: "Image processed successfully",
        description:
          "Your main image has been cropped and split into quadrants",
        variant: "default",
      });
    } catch (error) {
      console.error("Error splitting image:", error);
      toast({
        title: "Error",
        description: "Failed to process image quadrants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Resize cropped image to target dimensions
  const resizeImageToTarget = (imageData: ImageData): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        // Draw the image to exact target dimensions
        ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }

          const processedFile = new File([blob], imageData.name, {
            type: "image/png",
            lastModified: Date.now(),
          });

          const processedImageData: ImageData = {
            file: processedFile,
            src: URL.createObjectURL(blob),
            name: imageData.name,
            dimensions: `${TARGET_WIDTH}×${TARGET_HEIGHT}`,
          };

          resolve(processedImageData);
          URL.revokeObjectURL(img.src);
        }, "image/png");
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
        URL.revokeObjectURL(img.src);
      };

      img.src = imageData.src;
    });
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageForCrop(null);
  };

  const removeMainImage = () => {
    onImageProcessed(undefined as any, []);
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
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  return (
    <motion.div
      className="cartoon-card"
      variants={createAccessibleVariants(staggerContainer)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="text-center mb-4 sm:mb-6"
        variants={createAccessibleVariants(staggerItem)}
      >
        <h2 className="text-2xl sm:text-3xl font-bold cartoon-text text-gray-900 mb-2 sm:mb-3 px-2">
          Upload Your Main Image
        </h2>
        <p className="text-gray-700 text-base sm:text-lg max-w-2xl mx-auto px-4">
          Upload any image and you'll crop it to the perfect 16:9 ratio for
          Twitter tiles. The image will then be split into 4 quadrants for the
          expandable effect.
        </p>
      </motion.div>

      <motion.div
        className="max-w-2xl mx-auto px-2 sm:px-0"
        variants={createAccessibleVariants(staggerItem)}
      >
        {!mainImage ? (
          <motion.div
            {...getRootProps()}
            className="border-3 border-dashed rounded-2xl p-4 sm:p-8 text-center cursor-pointer border-black"
            variants={createAccessibleVariants(uploadVariants)}
            animate={
              isDragActive ? "dragOver" : isProcessing ? "uploading" : "idle"
            }
            whileHover="dragOver"
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            <div className="mb-4">
              <motion.div
                className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4"
                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{
                  duration: 0.5,
                  repeat: isDragActive ? Infinity : 0,
                }}
              >
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </motion.div>
              <motion.h3
                className="text-base sm:text-lg font-semibold text-gray-900 mb-2"
                animate={isDragActive ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                {isDragActive
                  ? "Drop your image here"
                  : "Drop your main image here"}
              </motion.h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                PNG, JPG up to 10MB • You'll crop to 16:9 next
              </p>
              <motion.button
                type="button"
                className="cartoon-button-primary px-4 py-2 sm:px-6 sm:py-3 disabled:opacity-50 text-sm sm:text-base"
                disabled={isProcessing}
                variants={createAccessibleVariants(buttonVariants)}
                whileHover="hover"
                whileTap="tap"
              >
                {isProcessing ? "Processing..." : "Choose File"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Image Preview */}
            <motion.div
              className="mt-4 sm:mt-6"
              variants={createAccessibleVariants(staggerItem)}
            >
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                    Main Image Preview
                  </h4>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={handleEditMainImage}
                      className="text-blue-500 hover:text-blue-700 text-xs sm:text-sm transition-colors"
                      title="Crop image"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Crop
                    </motion.button>
                    <motion.button
                      onClick={removeMainImage}
                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm transition-colors"
                      title="Remove image"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Remove
                    </motion.button>
                  </div>
                </div>
                <motion.img
                  src={mainImage.src}
                  alt="Main image preview"
                  className="w-full h-auto rounded-lg shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-3 text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0">
                  <span className="truncate">{mainImage.name}</span>
                  <span>{mainImage.dimensions}</span>
                </div>
              </div>
            </motion.div>

            {/* Quadrant Preview */}
            {quadrants && quadrants.length > 0 && (
              <motion.div
                className="mt-4 sm:mt-6"
                variants={createAccessibleVariants(staggerContainer)}
                initial="hidden"
                animate="visible"
              >
                <motion.h4
                  className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
                  variants={createAccessibleVariants(staggerItem)}
                >
                  Main Image Split Preview
                </motion.h4>
                <motion.div
                  className="grid grid-cols-2 gap-1 sm:gap-2"
                  variants={createAccessibleVariants(staggerContainer)}
                >
                  {quadrants.map((quadrant, index) => (
                    <motion.div
                      key={index}
                      className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative"
                      variants={createAccessibleVariants(staggerItem)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img
                        src={URL.createObjectURL(quadrant.blob)}
                        alt={`${quadrant.name} quadrant`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-1 sm:p-2 bg-white bg-opacity-90">
                        <span className="text-xs font-medium text-gray-700">
                          {quadrant.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="flex justify-center sm:justify-end mt-6 sm:mt-8 px-2 sm:px-0"
        variants={createAccessibleVariants(staggerItem)}
      >
        <motion.button
          onClick={onNext}
          className="cartoon-button-primary text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          disabled={!mainImage || !quadrants?.length || isProcessing}
          variants={createAccessibleVariants(buttonVariants)}
          whileHover={
            !mainImage || !quadrants?.length || isProcessing ? {} : "hover"
          }
          whileTap={
            !mainImage || !quadrants?.length || isProcessing ? {} : "tap"
          }
        >
          <span className="hidden sm:inline">Next: Surrounding Images</span>
          <span className="sm:hidden">Add Surrounding Images</span>
        </motion.button>
      </motion.div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageForCrop && (
        <ImageCropper
          isOpen={showCropper}
          onClose={handleCropCancel}
          imageData={tempImageForCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </motion.div>
  );
}
