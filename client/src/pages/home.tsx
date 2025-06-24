import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import StepIndicator from '@/components/step-indicator';
import MainImageUploader from '@/components/main-image-uploader';
import SurroundingImagesUploader from '@/components/surrounding-images-uploader';
import ImagePreview from '@/components/image-preview';
import LoadingOverlay from '@/components/loading-overlay';
import { TileSnapLogoCompact } from '@/components/tilesnap-logo';
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
      <div className="min-h-screen">
        {/* Header */}
        <header className="cartoon-card mx-4 my-6 mb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <TileSnapLogoCompact size={50} />
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <button className="cartoon-button-secondary text-sm px-4 py-2">
                    ← Back to Home
                  </button>
                </Link>
              </div>
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
