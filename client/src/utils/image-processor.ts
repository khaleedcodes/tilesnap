import JSZip from "jszip";
import {
  ImageData,
  QuadrantImage,
  SurroundingImages,
  FinalImage,
} from "@/types/image-types";

export const TARGET_WIDTH = 1214;
export const TARGET_HEIGHT = 683;
export const FINAL_IMAGE_WIDTH = 1214;
export const FINAL_IMAGE_HEIGHT = 2048;

export function validateImageAspectRatio(file: File): Promise<boolean> {
  // Always return true since we now handle cropping manually
  return Promise.resolve(true);
}

export function processImageFile(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Return the original image data without automatic processing
      const imageData: ImageData = {
        file: file,
        src: URL.createObjectURL(file),
        name: file.name,
        dimensions: `${img.width}×${img.height}`,
      };

      resolve(imageData);
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

export function splitImageIntoQuadrants(
  imageData: ImageData
): Promise<QuadrantImage[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const quadrants: QuadrantImage[] = [];
      const quadrantWidth = TARGET_WIDTH / 2;
      const quadrantHeight = TARGET_HEIGHT / 2;

      const positions = [
        { x: 0, y: 0, name: "TopLeft" },
        { x: quadrantWidth, y: 0, name: "TopRight" },
        { x: 0, y: quadrantHeight, name: "BottomLeft" },
        { x: quadrantWidth, y: quadrantHeight, name: "BottomRight" },
      ];

      positions.forEach(({ x, y, name }) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        canvas.width = quadrantWidth;
        canvas.height = quadrantHeight;

        ctx.drawImage(
          img,
          x,
          y,
          quadrantWidth,
          quadrantHeight,
          0,
          0,
          quadrantWidth,
          quadrantHeight
        );

        canvas.toBlob((blob) => {
          if (blob) {
            quadrants.push({
              canvas,
              blob,
              name,
            });

            if (quadrants.length === 4) {
              resolve(quadrants);
            }
          }
        }, "image/png");
      });
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageData.src;
  });
}

export function createFinalImages(
  quadrants: QuadrantImage[],
  surroundingImages: SurroundingImages
): Promise<FinalImage[]> {
  return new Promise((resolve, reject) => {
    const finalImages: FinalImage[] = [];
    const positions = [
      "topLeft",
      "topRight",
      "bottomLeft",
      "bottomRight",
    ] as const;

    positions.forEach((position, index) => {
      const quadrant = quadrants[index];
      const surrounding = surroundingImages[position];

      if (!quadrant) {
        reject(new Error(`Missing quadrant for position ${position}`));
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      canvas.width = FINAL_IMAGE_WIDTH;
      canvas.height = FINAL_IMAGE_HEIGHT;

      // Draw surrounding images and quadrant
      const promises: Promise<void>[] = [];

      // Top surrounding image
      if (surrounding.top) {
        promises.push(
          loadImageFromData(surrounding.top).then((img) => {
            ctx.drawImage(img, 0, 0, FINAL_IMAGE_WIDTH, 683);
          })
        );
      }

      // Main quadrant in middle
      promises.push(
        loadImageFromBlob(quadrant.blob).then((img) => {
          ctx.drawImage(img, 0, 683, FINAL_IMAGE_WIDTH, 683);
        })
      );

      // Bottom surrounding image
      if (surrounding.bottom) {
        promises.push(
          loadImageFromData(surrounding.bottom).then((img) => {
            ctx.drawImage(img, 0, 1366, FINAL_IMAGE_WIDTH, 683);
          })
        );
      }

      Promise.all(promises)
        .then(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              finalImages.push({
                blob,
                name: `${index + 1}_${quadrant.name}_Full.png`,
                order: index + 1,
                label: `${quadrant.name} Full Tile`,
              });

              if (finalImages.length === 4) {
                resolve(finalImages.sort((a, b) => a.order - b.order));
              }
            }
          }, "image/png");
        })
        .catch(reject);
    });
  });
}

function loadImageFromData(imageData: ImageData): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageData.src;
  });
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image from blob"));
    };
    img.src = URL.createObjectURL(blob);
  });
}

export function downloadImage(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function createQuadrantOnlyImages(
  quadrants: QuadrantImage[]
): Promise<FinalImage[]> {
  return new Promise((resolve) => {
    const quadrantOnlyImages: FinalImage[] = quadrants.map(
      (quadrant, index) => ({
        blob: quadrant.blob,
        name: `${index + 1}_${quadrant.name}_Only.png`,
        order: index + 1,
        label: `${quadrant.name} Only`,
      })
    );

    resolve(quadrantOnlyImages.sort((a, b) => a.order - b.order));
  });
}

export async function downloadAllAsZip(
  finalImages: FinalImage[],
  zipName: string = "twitter-tiles.zip"
) {
  const zip = new JSZip();

  for (const image of finalImages) {
    zip.file(image.name, image.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadImage(zipBlob, zipName);
}

export async function downloadQuadrantsAsZip(quadrantImages: FinalImage[]) {
  return downloadAllAsZip(quadrantImages, "quadrants-only.zip");
}

export async function downloadFullTilesAsZip(fullTileImages: FinalImage[]) {
  return downloadAllAsZip(fullTileImages, "full-tiles.zip");
}
