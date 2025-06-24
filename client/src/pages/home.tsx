import { useState, useEffect } from 'react';
import StepIndicator from '@/components/step-indicator';
import MainImageUploader from '@/components/main-image-uploader';
import SurroundingImagesUploader from '@/components/surrounding-images-uploader';
import ImagePreview from '@/components/image-preview';
import LoadingOverlay from '@/components/loading-overlay';
import { ImageData, QuadrantImage, SurroundingImages, FinalImage, StepNumber } from '@/types/image-types';
import { createFinalImages } from '@/utils/image-processor';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [mainImage, setMainImage] = useState<ImageData | undefined>();
  const [quadrants, setQuadrants] = useState<QuadrantImage[]>([]);
  const [surroundingImages, setSurroundingImages] = useState<SurroundingImages>({
    topLeft: {},
    topRight: {},
    bottomLeft: {},
    bottomRight: {}
  });
  const [finalImages, setFinalImages] = useState<FinalImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process final images when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && quadrants.length > 0) {
      processeFinalImages();
    }
  }, [currentStep, quadrants, surroundingImages]);

  const processeFinalImages = async () => {
    setIsProcessing(true);
    try {
      const finals = await createFinalImages(quadrants, surroundingImages);
      setFinalImages(finals);
    } catch (error) {
      console.error('Error creating final images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMainImageProcessed = (imageData: ImageData, imageQuadrants: QuadrantImage[]) => {
    setMainImage(imageData);
    setQuadrants(imageQuadrants);
  };

  const handleSurroundingImagesChange = (images: SurroundingImages) => {
    setSurroundingImages(images);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as StepNumber);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setMainImage(undefined);
    setQuadrants([]);
    setSurroundingImages({
      topLeft: {},
      topRight: {},
      bottomLeft: {},
      bottomRight: {}
    });
    setFinalImages([]);
  };

  return (
    <>
      <div className="font-sans bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <i className="fab fa-twitter text-white text-lg"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Twitter Tile Creator</h1>
                  <p className="text-sm text-gray-500">Create expandable photo tiles</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <i className="fas fa-question-circle text-lg"></i>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepIndicator currentStep={currentStep} />

          <div className="space-y-8">
            {currentStep === 1 && (
              <MainImageUploader
                onImageProcessed={handleMainImageProcessed}
                onNext={handleNextStep}
                mainImage={mainImage}
                quadrants={quadrants}
              />
            )}

            {currentStep === 2 && (
              <SurroundingImagesUploader
                surroundingImages={surroundingImages}
                onImagesChange={handleSurroundingImagesChange}
                onNext={handleNextStep}
                onPrevious={handlePreviousStep}
              />
            )}

            {currentStep === 3 && finalImages.length > 0 && (
              <ImagePreview
                finalImages={finalImages}
                onPrevious={handlePreviousStep}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        </main>
      </div>

      <LoadingOverlay isVisible={isProcessing} message="Creating final images..." />
    </>
  );
}
