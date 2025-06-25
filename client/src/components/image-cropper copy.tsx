import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageData } from "@/types/image-types";
import {
  modalVariants,
  backdropVariants,
  createAccessibleVariants,
  buttonVariants,
} from "@/lib/animations";

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: ImageData;
  onCropComplete: (croppedImageData: ImageData) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ASPECT_RATIO = 16 / 9; // 16:9 aspect ratio for Twitter tiles

export default function ImageCropper({
  isOpen,
  onClose,
  imageData,
  onCropComplete,
}: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [imageScale, setImageScale] = useState(1);

  // Initialize crop area when image loads
  const initializeCropArea = useCallback((img: HTMLImageElement) => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 32; // Account for padding
    const containerHeight = containerRect.height - 120; // Account for padding and controls

    // Calculate scale to fit image in container
    const scale = Math.min(
      containerWidth / img.naturalWidth,
      containerHeight / img.naturalHeight,
      1 // Don't scale up
    );

    setImageScale(scale);

    const displayWidth = img.naturalWidth * scale;
    const displayHeight = img.naturalHeight * scale;

    setContainerDimensions({ width: displayWidth, height: displayHeight });

    // Calculate initial crop area (80% of image, centered)
    const maxCropWidth = displayWidth * 0.8;
    const maxCropHeight = displayHeight * 0.8;

    // Maintain 16:9 aspect ratio
    let cropWidth = maxCropWidth;
    let cropHeight = cropWidth / ASPECT_RATIO;

    // If height exceeds bounds, adjust based on height
    if (cropHeight > maxCropHeight) {
      cropHeight = maxCropHeight;
      cropWidth = cropHeight * ASPECT_RATIO;
    }

    setCropArea({
      x: (displayWidth - cropWidth) / 2,
      y: (displayHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    });
  }, []);

  // Constrain crop area to image boundaries
  const constrainCropArea = useCallback(
    (newCrop: CropArea) => {
      const { width: displayWidth, height: displayHeight } =
        containerDimensions;
      if (!displayWidth || !displayHeight) return newCrop;

      // Constrain to image boundaries
      const constrainedCrop = {
        x: Math.max(0, Math.min(newCrop.x, displayWidth - newCrop.width)),
        y: Math.max(0, Math.min(newCrop.y, displayHeight - newCrop.height)),
        width: Math.min(newCrop.width, displayWidth),
        height: Math.min(newCrop.height, displayHeight),
      };

      // Maintain 16:9 aspect ratio
      const aspectWidth = constrainedCrop.height * ASPECT_RATIO;
      if (aspectWidth <= displayWidth - constrainedCrop.x) {
        constrainedCrop.width = aspectWidth;
      } else {
        constrainedCrop.height = constrainedCrop.width / ASPECT_RATIO;
        // Adjust position if needed
        if (constrainedCrop.y + constrainedCrop.height > displayHeight) {
          constrainedCrop.y = displayHeight - constrainedCrop.height;
        }
      }

      return constrainedCrop;
    },
    [containerDimensions]
  );

  // Handle resize operations
  const handleResize = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!resizeHandle) return;

      let newCrop = { ...cropArea };
      const minSize = 50; // Minimum crop size

      switch (resizeHandle) {
        case "se": // Bottom-right corner
          const newWidth = Math.max(minSize, mouseX - cropArea.x);
          newCrop.width = newWidth;
          newCrop.height = newWidth / ASPECT_RATIO;
          break;
        case "sw": // Bottom-left corner
          const deltaX = cropArea.x - mouseX;
          const newWidthSW = Math.max(minSize, cropArea.width + deltaX);
          newCrop.x = cropArea.x + cropArea.width - newWidthSW;
          newCrop.width = newWidthSW;
          newCrop.height = newWidthSW / ASPECT_RATIO;
          break;
        case "ne": // Top-right corner
          const deltaY = cropArea.y - mouseY;
          const newHeightNE = Math.max(
            minSize / ASPECT_RATIO,
            cropArea.height + deltaY
          );
          const newWidthNE = newHeightNE * ASPECT_RATIO;
          newCrop.y = cropArea.y + cropArea.height - newHeightNE;
          newCrop.width = newWidthNE;
          newCrop.height = newHeightNE;
          break;
        case "nw": // Top-left corner
          const deltaXNW = cropArea.x - mouseX;
          const deltaYNW = cropArea.y - mouseY;
          const newWidthNW = Math.max(minSize, cropArea.width + deltaXNW);
          newCrop.x = cropArea.x + cropArea.width - newWidthNW;
          newCrop.width = newWidthNW;
          newCrop.height = newWidthNW / ASPECT_RATIO;
          newCrop.y = cropArea.y + cropArea.height - newCrop.height;
          break;
      }

      setCropArea(constrainCropArea(newCrop));
    },
    [cropArea, resizeHandle, constrainCropArea]
  );

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent, handle?: string) => {
    if (!imageLoaded) return;
    e.preventDefault();

    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - (handle ? 0 : cropArea.x),
        y: e.clientY - rect.top - (handle ? 0 : cropArea.y),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageLoaded || (!isDragging && !isResizing)) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging) {
      const newX = mouseX - dragStart.x;
      const newY = mouseY - dragStart.y;

      const constrainedCrop = constrainCropArea({
        x: newX,
        y: newY,
        width: cropArea.width,
        height: cropArea.height,
      });

      setCropArea(constrainedCrop);
    } else if (isResizing) {
      handleResize(mouseX, mouseY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle("");
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, handle?: string) => {
    if (!imageLoaded || e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as React.MouseEvent;

    handleMouseDown(mouseEvent, handle);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imageLoaded || e.touches.length !== 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const mouseEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
    } as React.MouseEvent;

    handleMouseMove(mouseEvent);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  // Image load handler
  const handleImageLoad = () => {
    const img = imageRef.current;
    if (img) {
      initializeCropArea(img);
      setImageLoaded(true);
    }
  };

  // Crop confirmation handler
  const handleCropConfirm = async () => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);

    try {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Failed to get canvas context");

      // Calculate actual crop dimensions
      const actualCropX = cropArea.x / imageScale;
      const actualCropY = cropArea.y / imageScale;
      const actualCropWidth = cropArea.width / imageScale;
      const actualCropHeight = cropArea.height / imageScale;

      // Set canvas size to cropped area
      canvas.width = actualCropWidth;
      canvas.height = actualCropHeight;

      // Draw cropped portion
      ctx.drawImage(
        img,
        actualCropX,
        actualCropY,
        actualCropWidth,
        actualCropHeight,
        0,
        0,
        actualCropWidth,
        actualCropHeight
      );

      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Failed to create blob");

        const actualCropWidthRounded = Math.round(actualCropWidth);
        const actualCropHeightRounded = Math.round(actualCropHeight);

        const croppedImageData: ImageData = {
          file: new File([blob], imageData.name, { type: blob.type }),
          src: URL.createObjectURL(blob),
          name: imageData.name,
          dimensions: `${actualCropWidthRounded}×${actualCropHeightRounded}`,
        };

        onCropComplete(croppedImageData);
        onClose();
      }, "image/png");
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      setIsProcessing(false);
      setCropArea({ x: 0, y: 0, width: 0, height: 0 });
      setContainerDimensions({ width: 0, height: 0 });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div
            variants={createAccessibleVariants(backdropVariants)}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
          <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden p-0">
            <div className="flex flex-col h-full max-h-[95vh]">
              <DialogHeader className="p-4 sm:p-6 border-b">
                <DialogTitle className="cartoon-text text-lg sm:text-xl">
                  Crop Your Image
                </DialogTitle>
              </DialogHeader>

              <motion.div
                className="flex-1 flex flex-col p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden"
                variants={createAccessibleVariants(modalVariants)}
                initial="hidden"
                animate="visible"
              >
                <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                  <p className="font-medium text-blue-800 mb-1">
                    📏 16:9 Aspect Ratio Lock
                  </p>
                  <p className="hidden sm:block">
                    Drag the crop area to reposition it. Use corner handles to
                    resize. The aspect ratio will automatically maintain 16:9
                    for optimal Twitter tiles.
                  </p>
                  <p className="sm:hidden">
                    Drag to reposition, use corners to resize. 16:9 ratio locked
                    for Twitter.
                  </p>
                </div>

                <div
                  ref={containerRef}
                  className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 min-h-0 flex items-center justify-center"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: "none" }}
                >
                  {imageData.src && (
                    <div className="relative max-w-full max-h-full">
                      <img
                        ref={imageRef}
                        src={imageData.src}
                        alt="Image to crop"
                        className="max-w-full max-h-full object-contain select-none"
                        style={{
                          width: containerDimensions.width || "auto",
                          height: containerDimensions.height || "auto",
                        }}
                        onLoad={handleImageLoad}
                        draggable={false}
                      />

                      {imageLoaded && containerDimensions.width > 0 && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20 cursor-move select-none"
                          style={{
                            left: cropArea.x,
                            top: cropArea.y,
                            width: cropArea.width,
                            height: cropArea.height,
                          }}
                          onMouseDown={(e) => handleMouseDown(e)}
                          onTouchStart={(e) => handleTouchStart(e)}
                        >
                          {/* Grid lines for rule of thirds */}
                          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div
                                key={i}
                                className={`border-white border-opacity-30 ${
                                  i % 3 !== 2 ? "border-r" : ""
                                } ${i < 6 ? "border-b" : ""}`}
                              />
                            ))}
                          </div>

                          {/* Resize handles */}
                          <div
                            className="absolute -top-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border-2 border-white cursor-nw-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) => handleMouseDown(e, "nw")}
                            onTouchStart={(e) => handleTouchStart(e, "nw")}
                          ></div>
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border-2 border-white cursor-ne-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) => handleMouseDown(e, "ne")}
                            onTouchStart={(e) => handleTouchStart(e, "ne")}
                          ></div>
                          <div
                            className="absolute -bottom-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border-2 border-white cursor-sw-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) => handleMouseDown(e, "sw")}
                            onTouchStart={(e) => handleTouchStart(e, "sw")}
                          ></div>
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 border-2 border-white cursor-se-resize hover:bg-blue-600 transition-colors"
                            onMouseDown={(e) => handleMouseDown(e, "se")}
                            onTouchStart={(e) => handleTouchStart(e, "se")}
                          ></div>

                          {/* Center indicator */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-60"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0 pt-2 border-t">
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <p>
                      Crop Size: {Math.round(cropArea.width / imageScale)}×
                      {Math.round(cropArea.height / imageScale)} pixels
                    </p>
                    <p className="hidden sm:block">
                      Aspect Ratio: 16:9 (locked)
                    </p>
                  </div>

                  <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
                    <motion.button
                      onClick={onClose}
                      disabled={isProcessing}
                      className="flex-1 sm:flex-none cartoon-button-secondary px-4 py-2 text-sm disabled:opacity-50"
                      variants={createAccessibleVariants(buttonVariants)}
                      whileHover={!isProcessing ? "hover" : undefined}
                      whileTap={!isProcessing ? "tap" : undefined}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleCropConfirm}
                      disabled={isProcessing || !imageLoaded}
                      className="flex-1 sm:flex-none cartoon-button-primary px-4 py-2 text-sm disabled:opacity-50"
                      variants={createAccessibleVariants(buttonVariants)}
                      whileHover={
                        !isProcessing && imageLoaded ? "hover" : undefined
                      }
                      whileTap={
                        !isProcessing && imageLoaded ? "tap" : undefined
                      }
                    >
                      {isProcessing ? "Processing..." : "Apply Crop"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Hidden canvas for cropping */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
