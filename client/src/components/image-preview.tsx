import { useState } from 'react';
import { FinalImage } from '@/types/image-types';
import { downloadImage, downloadAllAsZip } from '@/utils/image-processor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ImagePreviewProps {
  finalImages: FinalImage[];
  onPrevious: () => void;
  onStartOver: () => void;
}

export default function ImagePreview({ finalImages, onPrevious, onStartOver }: ImagePreviewProps) {
  const [previewImage, setPreviewImage] = useState<FinalImage | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePreviewImage = (image: FinalImage) => {
    setPreviewImage(image);
  };

  const handleDownloadSingle = (image: FinalImage) => {
    downloadImage(image.blob, image.name);
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      await downloadAllAsZip(finalImages);
    } catch (error) {
      console.error('Error downloading ZIP:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadIndividual = () => {
    finalImages.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image.blob, image.name);
      }, index * 500); // Stagger downloads
    });
  };

  const getColorClass = (index: number) => {
    const colors = ['blue', 'green', 'purple', 'orange'];
    return colors[index];
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview & Export</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Review your Twitter tile images and download them in the correct order for posting.
        </p>
      </div>

      <div className="space-y-8">
        {/* Final Images Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {finalImages.map((image, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <div className={`w-6 h-6 bg-${getColorClass(index)}-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2`}>
                    {image.order}
                  </div>
                  <span>{image.label}</span>
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreviewImage(image)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-eye mr-1"></i>Preview
                  </button>
                  <button
                    onClick={() => handleDownloadSingle(image)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                  >
                    <i className="fas fa-download mr-1"></i>Download
                  </button>
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
                1214 × 683px • Ready for Twitter
              </div>
            </div>
          ))}
        </div>

        {/* Download Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Post!</h3>
            <p className="text-sm text-gray-600">
              Download all images and post them to Twitter in the numbered order for the best tile effect.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Preparing ZIP...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  Download All (ZIP)
                </>
              )}
            </button>
            <button
              onClick={handleDownloadIndividual}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <i className="fas fa-images mr-2"></i>
              Download Individual
            </button>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="fas fa-lightbulb text-amber-600 text-sm"></i>
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">How to Post on Twitter</h4>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Post the first image (01_TopLeft.jpg) with your caption</li>
                <li>Reply to your tweet with the second image (02_TopRight.jpg)</li>
                <li>Reply to that tweet with the third image (03_BottomLeft.jpg)</li>
                <li>Reply to that tweet with the fourth image (04_BottomRight.jpg)</li>
              </ol>
              <p className="text-xs text-amber-700 mt-2">
                This creates an expandable tile effect where users can tap through your images!
              </p>
            </div>
          </div>
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
          onClick={onStartOver}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <i className="fas fa-refresh mr-2"></i>Start Over
        </button>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewImage?.label || 'Image Preview'}</DialogTitle>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
