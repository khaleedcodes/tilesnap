import JSZip from 'jszip';
import { ImageData, QuadrantImage, SurroundingImages, FinalImage } from '@/types/image-types';

export const TARGET_WIDTH = 1214;
export const TARGET_HEIGHT = 683;
export const FINAL_IMAGE_WIDTH = 1214;
export const FINAL_IMAGE_HEIGHT = 2048;

export function validateImageAspectRatio(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const target = 16 / 9;
      const tolerance = 0.1;
      resolve(Math.abs(aspectRatio - target) <= tolerance);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });
}

export function processImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = img.width / img.height;
      const targetAspectRatio = 16 / 9;
      
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;

      if (aspectRatio > targetAspectRatio) {
        // Image is wider than target, crop width
        sourceWidth = img.height * targetAspectRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else if (aspectRatio < targetAspectRatio) {
        // Image is taller than target, crop height
        sourceHeight = img.width / targetAspectRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, TARGET_WIDTH, TARGET_HEIGHT
      );

      const processedSrc = canvas.toDataURL('image/jpeg', 0.9);
      
      resolve({
        file,
        src: processedSrc,
        name: file.name,
        dimensions: `${TARGET_WIDTH} × ${TARGET_HEIGHT}px`
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function splitImageIntoQuadrants(imageData: ImageData): Promise<QuadrantImage[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const quadrants: QuadrantImage[] = [];
      const quadrantWidth = TARGET_WIDTH / 2;
      const quadrantHeight = TARGET_HEIGHT / 2;
      
      const positions = [
        { x: 0, y: 0, name: 'TopLeft' },
        { x: quadrantWidth, y: 0, name: 'TopRight' },
        { x: 0, y: quadrantHeight, name: 'BottomLeft' },
        { x: quadrantWidth, y: quadrantHeight, name: 'BottomRight' }
      ];

      positions.forEach(({ x, y, name }) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = quadrantWidth;
        canvas.height = quadrantHeight;
        
        ctx.drawImage(
          img,
          x, y, quadrantWidth, quadrantHeight,
          0, 0, quadrantWidth, quadrantHeight
        );

        canvas.toBlob((blob) => {
          if (blob) {
            quadrants.push({
              canvas,
              blob,
              name
            });
            
            if (quadrants.length === 4) {
              resolve(quadrants);
            }
          }
        }, 'image/jpeg', 0.9);
      });
    };
    
    img.onerror = () => reject(new Error('Failed to process main image'));
    img.src = imageData.src;
  });
}

export function createFinalImages(
  quadrants: QuadrantImage[],
  surroundingImages: SurroundingImages
): Promise<FinalImage[]> {
  return new Promise((resolve, reject) => {
    const finalImages: FinalImage[] = [];
    const quadrantOrder = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
    
    let processedCount = 0;
    
    quadrants.forEach((quadrant, index) => {
      const position = quadrantOrder[index];
      const surrounding = surroundingImages[position];
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = FINAL_IMAGE_WIDTH;
      canvas.height = FINAL_IMAGE_HEIGHT;
      
      // Always create a three-part composition for Twitter tiles
      const sectionHeight = TARGET_HEIGHT; // Each section is 683px tall
      
      if (surrounding.top && surrounding.bottom) {
        // Three-part composition: top image, quadrant, bottom image
        Promise.all([
          loadImageFromData(surrounding.top),
          loadImageFromBlob(quadrant.blob),
          loadImageFromData(surrounding.bottom)
        ]).then(([topImg, quadImg, bottomImg]) => {
          // Draw top image (0 to 683px)
          ctx.drawImage(topImg, 0, 0, FINAL_IMAGE_WIDTH, sectionHeight);
          // Draw quadrant in middle (683 to 1366px)
          ctx.drawImage(quadImg, 0, sectionHeight, FINAL_IMAGE_WIDTH, sectionHeight);
          // Draw bottom image (1366 to 2048px)
          ctx.drawImage(bottomImg, 0, sectionHeight * 2, FINAL_IMAGE_WIDTH, sectionHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              finalImages.push({
                blob,
                name: `0${index + 1}_${quadrant.name}.jpg`,
                order: index + 1,
                label: `0${index + 1}_${quadrant.name}.jpg`
              });
              
              processedCount++;
              if (processedCount === 4) {
                resolve(finalImages);
              }
            }
          }, 'image/jpeg', 0.9);
        }).catch(reject);
      } else if (surrounding.top) {
        // Two-part composition: top image, quadrant, then duplicate quadrant for bottom
        Promise.all([
          loadImageFromData(surrounding.top),
          loadImageFromBlob(quadrant.blob)
        ]).then(([topImg, quadImg]) => {
          // Draw top image (0 to 683px)
          ctx.drawImage(topImg, 0, 0, FINAL_IMAGE_WIDTH, sectionHeight);
          // Draw quadrant in middle (683 to 1366px)
          ctx.drawImage(quadImg, 0, sectionHeight, FINAL_IMAGE_WIDTH, sectionHeight);
          // Draw quadrant again at bottom (1366 to 2048px)
          ctx.drawImage(quadImg, 0, sectionHeight * 2, FINAL_IMAGE_WIDTH, sectionHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              finalImages.push({
                blob,
                name: `0${index + 1}_${quadrant.name}.jpg`,
                order: index + 1,
                label: `0${index + 1}_${quadrant.name}.jpg`
              });
              
              processedCount++;
              if (processedCount === 4) {
                resolve(finalImages);
              }
            }
          }, 'image/jpeg', 0.9);
        }).catch(reject);
      } else if (surrounding.bottom) {
        // Two-part composition: quadrant, then bottom image, then duplicate quadrant
        Promise.all([
          loadImageFromBlob(quadrant.blob),
          loadImageFromData(surrounding.bottom)
        ]).then(([quadImg, bottomImg]) => {
          // Draw quadrant at top (0 to 683px)
          ctx.drawImage(quadImg, 0, 0, FINAL_IMAGE_WIDTH, sectionHeight);
          // Draw quadrant in middle (683 to 1366px)
          ctx.drawImage(quadImg, 0, sectionHeight, FINAL_IMAGE_WIDTH, sectionHeight);
          // Draw bottom image (1366 to 2048px)
          ctx.drawImage(bottomImg, 0, sectionHeight * 2, FINAL_IMAGE_WIDTH, sectionHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              finalImages.push({
                blob,
                name: `0${index + 1}_${quadrant.name}.jpg`,
                order: index + 1,
                label: `0${index + 1}_${quadrant.name}.jpg`
              });
              
              processedCount++;
              if (processedCount === 4) {
                resolve(finalImages);
              }
            }
          }, 'image/jpeg', 0.9);
        }).catch(reject);
      } else {
        // Just the quadrant - repeat it three times to fill the canvas
        loadImageFromBlob(quadrant.blob).then((quadImg) => {
          // Draw quadrant three times to fill the 2048px height
          ctx.drawImage(quadImg, 0, 0, FINAL_IMAGE_WIDTH, sectionHeight);
          ctx.drawImage(quadImg, 0, sectionHeight, FINAL_IMAGE_WIDTH, sectionHeight);
          ctx.drawImage(quadImg, 0, sectionHeight * 2, FINAL_IMAGE_WIDTH, sectionHeight);
          
          canvas.toBlob((blob) => {
            if (blob) {
              finalImages.push({
                blob,
                name: `0${index + 1}_${quadrant.name}.jpg`,
                order: index + 1,
                label: `0${index + 1}_${quadrant.name}.jpg`
              });
              
              processedCount++;
              if (processedCount === 4) {
                resolve(finalImages);
              }
            }
          }, 'image/jpeg', 0.9);
        }).catch(reject);
      }
    });
  });
}

function loadImageFromData(imageData: ImageData): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageData.src;
  });
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllAsZip(finalImages: FinalImage[]) {
  const zip = new JSZip();
  
  finalImages.forEach((image) => {
    zip.file(image.name, image.blob);
  });
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadImage(zipBlob, 'twitter-tiles.zip');
}
