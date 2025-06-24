import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageData } from '@/types/image-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

export default function ImageCropper({ isOpen, onClose, imageData, onCropComplete }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const TARGET_ASPECT_RATIO = 16 / 9;

  useEffect(() => {
    if (isOpen && imageData) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        initializeCropArea(img);
      };
      img.src = imageData.src;
    }
  }, [isOpen, imageData]);

  const initializeCropArea = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxWidth = 600;
    const maxHeight = 400;
    
    let displayWidth = img.width;
    let displayHeight = img.height;
    
    if (displayWidth > maxWidth) {
      displayHeight = (displayHeight * maxWidth) / displayWidth;
      displayWidth = maxWidth;
    }
    
    if (displayHeight > maxHeight) {
      displayWidth = (displayWidth * maxHeight) / displayHeight;
      displayHeight = maxHeight;
    }

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    setCanvasSize({ width: displayWidth, height: displayHeight });

    // Calculate initial crop area maintaining 16:9 aspect ratio
    const cropWidth = Math.min(displayWidth, displayHeight * TARGET_ASPECT_RATIO);
    const cropHeight = cropWidth / TARGET_ASPECT_RATIO;
    
    const cropX = (displayWidth - cropWidth) / 2;
    const cropY = (displayHeight - cropHeight) / 2;

    setCropArea({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });

    drawCanvas(img, displayWidth, displayHeight, {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });
  };

  const drawCanvas = (img: HTMLImageElement, canvasWidth: number, canvasHeight: number, crop: CropArea) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw image
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Clear crop area
    ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

    // Draw crop area border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#3B82F6';
    const corners = [
      { x: crop.x - handleSize/2, y: crop.y - handleSize/2 },
      { x: crop.x + crop.width - handleSize/2, y: crop.y - handleSize/2 },
      { x: crop.x - handleSize/2, y: crop.y + crop.height - handleSize/2 },
      { x: crop.x + crop.width - handleSize/2, y: crop.y + crop.height - handleSize/2 }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
    });
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x, y });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    const newX = Math.max(0, Math.min(canvasSize.width - cropArea.width, cropArea.x + deltaX));
    const newY = Math.max(0, Math.min(canvasSize.height - cropArea.height, cropArea.y + deltaY));

    const newCropArea = {
      ...cropArea,
      x: newX,
      y: newY
    };

    setCropArea(newCropArea);
    drawCanvas(image, canvasSize.width, canvasSize.height, newCropArea);
    setDragStart({ x, y });
  }, [isDragging, dragStart, cropArea, canvasSize, image]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = async () => {
    if (!image || !imageData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1214;
    canvas.height = 683;

    // Calculate source coordinates based on the crop area
    const scaleX = image.width / canvasSize.width;
    const scaleY = image.height / canvasSize.height;

    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;

    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 1214, 683
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], imageData.name, { type: 'image/jpeg' });
        const croppedImageData: ImageData = {
          file: croppedFile,
          src: canvas.toDataURL('image/jpeg', 0.9),
          name: imageData.name,
          dimensions: '1214 × 683px'
        };
        onCropComplete(croppedImageData);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <p className="text-sm text-gray-600">
            Drag the crop area to select the portion you want to use. The aspect ratio is locked to 16:9.
          </p>
        </DialogHeader>
        
        <div className="p-4">
          <div className="flex justify-center mb-4">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCrop} className="bg-blue-600 hover:bg-blue-700">
              Apply Crop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}