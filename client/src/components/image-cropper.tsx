import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageData } from '@/types/image-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

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

    const maxWidth = 700;
    const maxHeight = 500;
    
    let displayWidth = img.width;
    let displayHeight = img.height;
    
    // Scale image to fit in canvas while maintaining aspect ratio
    const scaleX = maxWidth / img.width;
    const scaleY = maxHeight / img.height;
    const initialScale = Math.min(scaleX, scaleY, 1);
    
    displayWidth = img.width * initialScale;
    displayHeight = img.height * initialScale;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    setCanvasSize({ width: displayWidth, height: displayHeight });
    setScale(initialScale);
    setImageOffset({ x: 0, y: 0 });

    // Calculate initial crop area maintaining 16:9 aspect ratio
    const cropWidth = Math.min(displayWidth * 0.8, displayHeight * 0.8 * TARGET_ASPECT_RATIO);
    const cropHeight = cropWidth / TARGET_ASPECT_RATIO;
    
    const cropX = (displayWidth - cropWidth) / 2;
    const cropY = (displayHeight - cropHeight) / 2;

    setCropArea({
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });

    drawCanvas();
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled image dimensions
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    // Draw image with current scale and offset
    ctx.drawImage(
      image,
      imageOffset.x,
      imageOffset.y,
      scaledWidth,
      scaledHeight
    );

    // Draw dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area to show image underneath
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.restore();

    // Redraw image in crop area only
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    ctx.clip();
    ctx.drawImage(
      image,
      imageOffset.x,
      imageOffset.y,
      scaledWidth,
      scaledHeight
    );
    ctx.restore();

    // Draw crop area border
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

    // Draw corner handles
    const handleSize = 12;
    ctx.fillStyle = '#3B82F6';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    const handles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2, cursor: 'nw-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2, cursor: 'ne-resize' },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, cursor: 'sw-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, cursor: 'se-resize' },
      // Side handles
      { x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y - handleSize/2, cursor: 'n-resize' },
      { x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, cursor: 's-resize' },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2, cursor: 'w-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2, cursor: 'e-resize' }
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });

    // Draw grid lines in crop area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      const x = cropArea.x + (cropArea.width / 3) * i;
      const y = cropArea.y + (cropArea.height / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x, cropArea.y);
      ctx.lineTo(x, cropArea.y + cropArea.height);
      ctx.moveTo(cropArea.x, y);
      ctx.lineTo(cropArea.x + cropArea.width, y);
      ctx.stroke();
    }
  }, [image, scale, imageOffset, cropArea]);

  const getHandleAtPosition = (x: number, y: number) => {
    const handleSize = 12;
    const handles = [
      { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2, type: 'nw-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2, type: 'ne-resize' },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, type: 'sw-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, type: 'se-resize' },
      { x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y - handleSize/2, type: 'n-resize' },
      { x: cropArea.x + cropArea.width/2 - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2, type: 's-resize' },
      { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2, type: 'w-resize' },
      { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height/2 - handleSize/2, type: 'e-resize' }
    ];

    for (const handle of handles) {
      if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
        return handle.type;
      }
    }

    // Check if inside crop area for dragging
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width && 
        y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getHandleAtPosition(x, y);
    
    if (handle === 'move') {
      setIsDragging(true);
    } else if (handle && handle !== 'move') {
      setIsResizing(true);
      setResizeHandle(handle);
    }
    
    setDragStart({ x, y });
    e.preventDefault();
  }, [cropArea]);

  const constrainCropArea = (newCrop: CropArea) => {
    // Ensure crop area stays within canvas bounds
    const maxX = canvasSize.width - newCrop.width;
    const maxY = canvasSize.height - newCrop.height;
    
    return {
      x: Math.max(0, Math.min(maxX, newCrop.x)),
      y: Math.max(0, Math.min(maxY, newCrop.y)),
      width: Math.max(50, Math.min(canvasSize.width - newCrop.x, newCrop.width)),
      height: Math.max(50 / TARGET_ASPECT_RATIO, Math.min(canvasSize.height - newCrop.y, newCrop.height))
    };
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (!isDragging && !isResizing)) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    if (isDragging) {
      // Move crop area
      const newCrop = {
        ...cropArea,
        x: cropArea.x + deltaX,
        y: cropArea.y + deltaY
      };
      setCropArea(constrainCropArea(newCrop));
    } else if (isResizing) {
      // Resize crop area while maintaining aspect ratio
      let newCrop = { ...cropArea };
      
      switch (resizeHandle) {
        case 'se-resize':
          newCrop.width = Math.max(50, cropArea.width + deltaX);
          newCrop.height = newCrop.width / TARGET_ASPECT_RATIO;
          break;
        case 'sw-resize':
          const newWidth = Math.max(50, cropArea.width - deltaX);
          newCrop.x = cropArea.x + cropArea.width - newWidth;
          newCrop.width = newWidth;
          newCrop.height = newCrop.width / TARGET_ASPECT_RATIO;
          break;
        case 'ne-resize':
          newCrop.width = Math.max(50, cropArea.width + deltaX);
          newCrop.height = newCrop.width / TARGET_ASPECT_RATIO;
          newCrop.y = cropArea.y + cropArea.height - newCrop.height;
          break;
        case 'nw-resize':
          const newWidthNW = Math.max(50, cropArea.width - deltaX);
          newCrop.x = cropArea.x + cropArea.width - newWidthNW;
          newCrop.width = newWidthNW;
          newCrop.height = newCrop.width / TARGET_ASPECT_RATIO;
          newCrop.y = cropArea.y + cropArea.height - newCrop.height;
          break;
        case 'e-resize':
        case 'w-resize':
          const widthChange = resizeHandle === 'e-resize' ? deltaX : -deltaX;
          newCrop.width = Math.max(50, cropArea.width + widthChange);
          newCrop.height = newCrop.width / TARGET_ASPECT_RATIO;
          if (resizeHandle === 'w-resize') {
            newCrop.x = cropArea.x + cropArea.width - newCrop.width;
          }
          newCrop.y = cropArea.y + (cropArea.height - newCrop.height) / 2;
          break;
        case 'n-resize':
        case 's-resize':
          const heightChange = resizeHandle === 's-resize' ? deltaY : -deltaY;
          newCrop.height = Math.max(50 / TARGET_ASPECT_RATIO, cropArea.height + heightChange);
          newCrop.width = newCrop.height * TARGET_ASPECT_RATIO;
          if (resizeHandle === 'n-resize') {
            newCrop.y = cropArea.y + cropArea.height - newCrop.height;
          }
          newCrop.x = cropArea.x + (cropArea.width - newCrop.width) / 2;
          break;
      }
      
      setCropArea(constrainCropArea(newCrop));
    }

    setDragStart({ x, y });
  }, [isDragging, isResizing, dragStart, cropArea, canvasSize, resizeHandle]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // Update canvas when crop area changes
  useEffect(() => {
    if (image) {
      drawCanvas();
    }
  }, [drawCanvas, cropArea, scale, imageOffset]);

  const handleZoomChange = (newScale: number[]) => {
    setScale(newScale[0]);
  };

  const handleImagePan = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging || isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if we're not over the crop area or handles
    const handle = getHandleAtPosition(x, y);
    if (!handle) {
      canvas.style.cursor = 'grab';
    } else if (handle === 'move') {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = handle;
    }
  }, [cropArea, isDragging, isResizing]);

  const handleCrop = async () => {
    if (!image || !imageData) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1214;
    canvas.height = 683;

    // Calculate the actual image coordinates considering scale and offset
    const scaledImageWidth = image.width * scale;
    const scaledImageHeight = image.height * scale;

    // Convert crop area coordinates to source image coordinates
    const sourceX = (cropArea.x - imageOffset.x) / scale;
    const sourceY = (cropArea.y - imageOffset.y) / scale;
    const sourceWidth = cropArea.width / scale;
    const sourceHeight = cropArea.height / scale;

    // Ensure source coordinates are within image bounds
    const clampedSourceX = Math.max(0, Math.min(image.width - 1, sourceX));
    const clampedSourceY = Math.max(0, Math.min(image.height - 1, sourceY));
    const clampedSourceWidth = Math.min(sourceWidth, image.width - clampedSourceX);
    const clampedSourceHeight = Math.min(sourceHeight, image.height - clampedSourceY);

    ctx.drawImage(
      image,
      clampedSourceX, clampedSourceY, clampedSourceWidth, clampedSourceHeight,
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
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Drag the crop area to select the portion you want to use. Use the zoom slider to get a better view. The aspect ratio is locked to 16:9.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <div ref={containerRef} className="relative border border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={isDragging || isResizing ? handleMouseMove : handleImagePan}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: isDragging ? 'grabbing' : isResizing ? 'crosshair' : 'default' }}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 min-w-[80px]">Zoom:</label>
              <div className="flex-1 px-3">
                <Slider
                  value={[scale]}
                  onValueChange={handleZoomChange}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500 min-w-[60px]">{Math.round(scale * 100)}%</span>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScale(1)}
                className="text-xs"
              >
                Reset Zoom
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset crop to center
                  const cropWidth = Math.min(canvasSize.width * 0.8, canvasSize.height * 0.8 * TARGET_ASPECT_RATIO);
                  const cropHeight = cropWidth / TARGET_ASPECT_RATIO;
                  setCropArea({
                    x: (canvasSize.width - cropWidth) / 2,
                    y: (canvasSize.height - cropHeight) / 2,
                    width: cropWidth,
                    height: cropHeight
                  });
                }}
                className="text-xs"
              >
                Reset Crop
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
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