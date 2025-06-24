import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageData, SurroundingImages } from '@/types/image-types';
import { processImageFile } from '@/utils/image-processor';
import { useToast } from '@/hooks/use-toast';

interface SurroundingImagesUploaderProps {
  surroundingImages: SurroundingImages;
  onImagesChange: (images: SurroundingImages) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface ImageSlotProps {
  position: keyof SurroundingImages;
  slot: 'top' | 'bottom';
  image?: ImageData;
  onImageUpload: (position: keyof SurroundingImages, slot: 'top' | 'bottom', image: ImageData) => void;
  onImageRemove: (position: keyof SurroundingImages, slot: 'top' | 'bottom') => void;
}

function ImageSlot({ position, slot, image, onImageUpload, onImageRemove }: ImageSlotProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, JPEG)",
        variant: "destructive"
      });
      return;
    }

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
      const imageData = await processImageFile(file);
      onImageUpload(position, slot, imageData);
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
  }, [position, slot, onImageUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  if (image) {
    return (
      <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-9 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            <img
              src={image.src}
              alt={`${slot} image preview`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{image.name}</p>
            <p className="text-xs text-gray-500">{slot} image</p>
          </div>
          <button
            onClick={() => onImageRemove(position, slot)}
            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
        isDragActive
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <i className="fas fa-spinner fa-spin text-blue-400 mb-2"></i>
      ) : (
        <i className="fas fa-plus text-gray-400 mb-2"></i>
      )}
      <p className="text-sm text-gray-500">
        {isProcessing ? 'Processing...' : `${slot} image`}
      </p>
    </div>
  );
}

export default function SurroundingImagesUploader({
  surroundingImages,
  onImagesChange,
  onNext,
  onPrevious
}: SurroundingImagesUploaderProps) {
  const { toast } = useToast();

  const handleImageUpload = (position: keyof SurroundingImages, slot: 'top' | 'bottom', image: ImageData) => {
    const updatedImages = {
      ...surroundingImages,
      [position]: {
        ...surroundingImages[position],
        [slot]: image
      }
    };
    onImagesChange(updatedImages);
  };

  const handleImageRemove = (position: keyof SurroundingImages, slot: 'top' | 'bottom') => {
    const updatedImages = {
      ...surroundingImages,
      [position]: {
        ...surroundingImages[position],
        [slot]: undefined
      }
    };
    onImagesChange(updatedImages);
  };

  const getTotalUploadedImages = () => {
    let count = 0;
    Object.values(surroundingImages).forEach(section => {
      if (section.top) count++;
      if (section.bottom) count++;
    });
    return count;
  };

  const handleNext = () => {
    const uploadedCount = getTotalUploadedImages();
    if (uploadedCount === 0) {
      toast({
        title: "No surrounding images",
        description: "Upload at least one surrounding image to proceed",
        variant: "destructive"
      });
      return;
    }
    onNext();
  };

  const uploadedCount = getTotalUploadedImages();
  const progressPercentage = (uploadedCount / 8) * 100;

  const sections = [
    { key: 'topLeft' as const, title: 'Top Left Images', color: 'blue', abbreviation: 'TL' },
    { key: 'topRight' as const, title: 'Top Right Images', color: 'green', abbreviation: 'TR' },
    { key: 'bottomLeft' as const, title: 'Bottom Left Images', color: 'purple', abbreviation: 'BL' },
    { key: 'bottomRight' as const, title: 'Bottom Right Images', color: 'orange', abbreviation: 'BR' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Surrounding Images</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload images that will appear above and below each quadrant. These images will create the expandable tile effect when posted on Twitter.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {sections.map((section) => (
          <div key={section.key} className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <div className={`w-6 h-6 bg-${section.color}-100 text-${section.color}-600 rounded-full flex items-center justify-center text-xs font-bold mr-2`}>
                {section.abbreviation}
              </div>
              {section.title}
            </h3>
            <div className="space-y-3">
              <ImageSlot
                position={section.key}
                slot="top"
                image={surroundingImages[section.key].top}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
              />
              <ImageSlot
                position={section.key}
                slot="bottom"
                image={surroundingImages[section.key].bottom}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Upload Progress */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Upload Progress</span>
          <span className="text-sm text-blue-700">{uploadedCount} of 8 images</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          className="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium transition-colors flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          Preview & Export
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}
