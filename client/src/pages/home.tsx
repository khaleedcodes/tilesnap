import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  cardVariants,
  createAccessibleVariants,
} from "@/lib/animations";
import StepIndicator from "@/components/step-indicator";
import MainImageUploader from "@/components/main-image-uploader";
import SurroundingImagesUploader from "@/components/surrounding-images-uploader";
import ImagePreview from "@/components/image-preview";
import LoadingOverlay from "@/components/loading-overlay";
import { TileSnapLogoCompact } from "@/components/tilesnap-logo";
import {
  ImageData,
  QuadrantImage,
  SurroundingImages,
  FinalImage,
  StepNumber,
} from "@/types/image-types";
import {
  createFinalImages,
  createQuadrantOnlyImages,
} from "@/utils/image-processor";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [mainImage, setMainImage] = useState<ImageData | undefined>();
  const [quadrants, setQuadrants] = useState<QuadrantImage[]>([]);
  const [surroundingImages, setSurroundingImages] = useState<SurroundingImages>(
    {
      topLeft: {},
      topRight: {},
      bottomLeft: {},
      bottomRight: {},
    }
  );
  const [finalImages, setFinalImages] = useState<FinalImage[]>([]);
  const [quadrantOnlyImages, setQuadrantOnlyImages] = useState<FinalImage[]>(
    []
  );
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
      // Create both full tiles and quadrant-only images
      const [finals, quadrantsOnly] = await Promise.all([
        createFinalImages(quadrants, surroundingImages),
        createQuadrantOnlyImages(quadrants),
      ]);
      setFinalImages(finals);
      setQuadrantOnlyImages(quadrantsOnly);
    } catch (error) {
      console.error("Error creating final images:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMainImageProcessed = (
    imageData: ImageData,
    imageQuadrants: QuadrantImage[]
  ) => {
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
      bottomRight: {},
    });
    setFinalImages([]);
    setQuadrantOnlyImages([]);
  };

  return (
    <>
      <motion.div
        className="min-h-screen"
        variants={createAccessibleVariants(staggerContainer)}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header
          className="cartoon-card mx-4 my-6 mb-8"
          variants={createAccessibleVariants(staggerItem)}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <TileSnapLogoCompact size={50} />
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <motion.button
                    className="cartoon-button-secondary text-sm px-4 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Home
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div variants={createAccessibleVariants(staggerItem)}>
            <StepIndicator currentStep={currentStep} />
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={createAccessibleVariants(staggerContainer)}
          >
            {currentStep === 1 && (
              <motion.div variants={createAccessibleVariants(cardVariants)}>
                <MainImageUploader
                  onImageProcessed={handleMainImageProcessed}
                  onNext={handleNextStep}
                  mainImage={mainImage}
                  quadrants={quadrants}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div variants={createAccessibleVariants(cardVariants)}>
                <SurroundingImagesUploader
                  surroundingImages={surroundingImages}
                  onImagesChange={handleSurroundingImagesChange}
                  onNext={handleNextStep}
                  onPrevious={handlePreviousStep}
                />
              </motion.div>
            )}

            {currentStep === 3 && finalImages.length > 0 && (
              <motion.div variants={createAccessibleVariants(cardVariants)}>
                <ImagePreview
                  finalImages={finalImages}
                  quadrantOnlyImages={quadrantOnlyImages}
                  onPrevious={handlePreviousStep}
                  onStartOver={handleStartOver}
                />
              </motion.div>
            )}
          </motion.div>
        </main>
      </motion.div>

      <LoadingOverlay
        isVisible={isProcessing}
        message="Creating final images..."
      />
    </>
  );
}
