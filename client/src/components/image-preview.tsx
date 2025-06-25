import { useState } from "react";
import { motion } from "framer-motion";
import { FinalImage } from "@/types/image-types";
import {
  downloadImage,
  downloadAllAsZip,
  downloadQuadrantsAsZip,
  downloadFullTilesAsZip,
} from "@/utils/image-processor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  staggerContainer,
  staggerItem,
  buttonVariants,
  modalVariants,
  createAccessibleVariants,
} from "@/lib/animations";

interface ImagePreviewProps {
  finalImages: FinalImage[];
  quadrantOnlyImages: FinalImage[];
  onPrevious: () => void;
  onStartOver: () => void;
}

export default function ImagePreview({
  finalImages,
  quadrantOnlyImages,
  onPrevious,
  onStartOver,
}: ImagePreviewProps) {
  const [previewImage, setPreviewImage] = useState<FinalImage | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadingType, setDownloadingType] = useState<
    "quadrants" | "full" | null
  >(null);

  const handlePreviewImage = (image: FinalImage) => {
    setPreviewImage(image);
  };

  const handleDownloadSingle = (image: FinalImage) => {
    downloadImage(image.blob, image.name);
  };

  const handleDownloadQuadrantsOnly = async () => {
    setIsDownloading(true);
    setDownloadingType("quadrants");
    try {
      await downloadQuadrantsAsZip(quadrantOnlyImages);
    } catch (error) {
      console.error("Error downloading quadrants ZIP:", error);
    } finally {
      setIsDownloading(false);
      setDownloadingType(null);
    }
  };

  const handleDownloadFullTiles = async () => {
    setIsDownloading(true);
    setDownloadingType("full");
    try {
      await downloadFullTilesAsZip(finalImages);
    } catch (error) {
      console.error("Error downloading full tiles ZIP:", error);
    } finally {
      setIsDownloading(false);
      setDownloadingType(null);
    }
  };

  const handleDownloadIndividual = (images: FinalImage[], type: string) => {
    images.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image.blob, image.name);
      }, index * 500); // Stagger downloads
    });
  };

  const getColorClass = (index: number) => {
    const colors = ["blue", "green", "purple", "orange"];
    return colors[index];
  };

  return (
    <motion.div
      className="cartoon-card p-6 sm:p-8"
      variants={createAccessibleVariants(staggerContainer)}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="text-center mb-6"
        variants={createAccessibleVariants(staggerItem)}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preview & Export
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose your export format and download your Twitter tile images.
        </p>
      </motion.div>

      <motion.div
        className="space-y-8"
        variants={createAccessibleVariants(staggerContainer)}
      >
        {/* Preview Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          variants={createAccessibleVariants(staggerContainer)}
        >
          {finalImages.map((image, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors"
              variants={createAccessibleVariants(staggerItem)}
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                <h3 className="font-semibold text-gray-900 flex items-center text-sm sm:text-base">
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 bg-${getColorClass(
                      index
                    )}-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2`}
                  >
                    {image.order}
                  </div>
                  <span className="truncate">{image.label}</span>
                </h3>
                <div className="flex space-x-2 self-start sm:self-auto">
                  <motion.button
                    onClick={() => handlePreviewImage(image)}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Preview
                  </motion.button>
                  <motion.button
                    onClick={() => handleDownloadSingle(image)}
                    className="text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download
                  </motion.button>
                </div>
              </div>
              <div className="aspect-video bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <img
                  src={URL.createObjectURL(image.blob)}
                  alt={`Final tile image ${image.order}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                1214 × 2048px • Ready for Twitter
              </div>
            </motion.div>
          ))}
        </motion.div>
        {/* Export Options */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
          variants={createAccessibleVariants(staggerItem)}
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Choose Your Export Format
            </h3>
            <p className="text-sm text-gray-600">
              Pick the format that works best for your Twitter posting strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Full Tiles Option */}
            <motion.div
              className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors"
              variants={createAccessibleVariants(buttonVariants)}
              whileHover="hover"
            >
              <div className="text-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Full Tiles
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Complete stacked images (1214×2048px each) with top/bottom
                  surrounding images.
                </p>
              </div>
              <div className="space-y-3">
                <motion.button
                  onClick={handleDownloadFullTiles}
                  disabled={isDownloading && downloadingType === "full"}
                  className="cartoon-button-primary w-full"
                  variants={createAccessibleVariants(buttonVariants)}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {isDownloading && downloadingType === "full"
                    ? "Preparing ZIP..."
                    : "Download Full Tiles ZIP"}
                </motion.button>
                <motion.button
                  onClick={() => handleDownloadIndividual(finalImages, "full")}
                  className="cartoon-button-secondary w-full"
                  variants={createAccessibleVariants(buttonVariants)}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Download Individual Files
                </motion.button>
              </div>
            </motion.div>
            {/* Quadrants Only Option */}
            <motion.div
              className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors"
              variants={createAccessibleVariants(buttonVariants)}
              whileHover="hover"
            >
              <div className="text-center mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  Cropped Quadrants Only
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Just the 4 quadrant images (1214×683px each). Perfect for
                  simple posting.
                </p>
              </div>
              <div className="space-y-3">
                <motion.button
                  onClick={handleDownloadQuadrantsOnly}
                  disabled={isDownloading && downloadingType === "quadrants"}
                  className="cartoon-button-primary w-full"
                  variants={createAccessibleVariants(buttonVariants)}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {isDownloading && downloadingType === "quadrants"
                    ? "Preparing ZIP..."
                    : "Download Quadrants ZIP"}
                </motion.button>
                <motion.button
                  onClick={() =>
                    handleDownloadIndividual(quadrantOnlyImages, "quadrants")
                  }
                  className="cartoon-button-secondary w-full"
                  variants={createAccessibleVariants(buttonVariants)}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Download Individual Files
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Usage Instructions */}
        <motion.div
          className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6"
          variants={createAccessibleVariants(staggerItem)}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">
                How to Post on Twitter
              </h4>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Post the first image with your caption</li>
                <li>Reply to your tweet with the second image</li>
                <li>Reply to that tweet with the third image</li>
                <li>Reply to that tweet with the fourth image</li>
              </ol>
              <p className="text-xs text-amber-700 mt-2">
                This creates an expandable tile effect where users can tap
                through your images!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 space-y-3 sm:space-y-0 px-2 sm:px-0"
        variants={createAccessibleVariants(staggerItem)}
      >
        <motion.button
          onClick={onPrevious}
          className="cartoon-button-secondary px-4 py-2 sm:px-6 sm:py-3 w-full sm:w-auto order-2 sm:order-1"
          variants={createAccessibleVariants(buttonVariants)}
          whileHover="hover"
          whileTap="tap"
        >
          ← Back
        </motion.button>
        <motion.button
          onClick={onStartOver}
          className="cartoon-button-primary px-6 py-2 sm:px-8 sm:py-3 w-full sm:w-auto order-1 sm:order-2"
          variants={createAccessibleVariants(buttonVariants)}
          whileHover="hover"
          whileTap="tap"
        >
          Start Over
        </motion.button>
      </motion.div>

      {/* Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <motion.div
            variants={createAccessibleVariants(modalVariants)}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle>
                {previewImage?.label || "Image Preview"}
              </DialogTitle>
            </DialogHeader>
            <div className="p-4">
              {previewImage && (
                <img
                  src={URL.createObjectURL(previewImage.blob)}
                  alt="Preview"
                  className="w-full h-auto rounded-lg"
                />
              )}
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
