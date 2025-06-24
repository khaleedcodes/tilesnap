export interface ImageData {
  file: File;
  src: string;
  name: string;
  dimensions: string;
}

export interface QuadrantImage {
  canvas: HTMLCanvasElement;
  blob: Blob;
  name: string;
}

export interface SurroundingImages {
  topLeft: {
    top?: ImageData;
    bottom?: ImageData;
  };
  topRight: {
    top?: ImageData;
    bottom?: ImageData;
  };
  bottomLeft: {
    top?: ImageData;
    bottom?: ImageData;
  };
  bottomRight: {
    top?: ImageData;
    bottom?: ImageData;
  };
}

export interface FinalImage {
  blob: Blob;
  name: string;
  order: number;
  label: string;
}

export type StepNumber = 1 | 2 | 3;
