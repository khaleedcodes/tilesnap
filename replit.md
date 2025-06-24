# Twitter Photo Tile Creator

## Overview

This is a React TypeScript web application that helps users create expandable Twitter photo tiles. The app allows users to upload a main 16:9 image that gets split into 4 quadrants, along with 8 surrounding images that complement each quadrant. The final output is 4 optimized images ready for sequential Twitter posting to create an interactive tile effect.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: TailwindCSS with shadcn/ui component library for consistent, accessible UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks and context for local state management
- **Image Processing**: Canvas API for client-side image manipulation and cropping
- **File Handling**: JSZip for batch download functionality

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Development**: Vite for fast development builds and hot module replacement
- **Production**: ESBuild for optimized production builds
- **Static Serving**: Express serves the built React application in production

## Key Components

### Image Processing Pipeline
1. **Validation**: Ensures uploaded images meet 16:9 aspect ratio requirements
2. **Cropping**: Automatically crops images to 1214×683 pixels (Twitter's optimal dimensions)
3. **Quadrant Splitting**: Divides main image into 4 equal quadrants using Canvas API
4. **Final Assembly**: Combines quadrants with surrounding images to create 4 final tiles

### User Interface Components
- **StepIndicator**: Multi-step progress indicator for guided workflow
- **MainImageUploader**: Drag-and-drop interface for main image upload with validation
- **SurroundingImagesUploader**: Interface for uploading 8 surrounding images with clear slot labeling
- **ImagePreview**: Preview and download interface for final processed images
- **LoadingOverlay**: User feedback during image processing operations

### Core Utilities
- **image-processor.ts**: Handles all image manipulation, validation, and export functionality
- **Canvas-based processing**: Client-side image operations without server dependencies
- **Batch export**: ZIP file generation for easy download of all 4 tiles

## Data Flow

1. **Upload Phase**: User uploads main 16:9 image → validation → quadrant generation
2. **Surrounding Images**: User uploads 8 additional images for each quadrant position
3. **Processing Phase**: Client-side canvas operations combine images into final 4 tiles
4. **Export Phase**: Generate downloadable files with proper naming convention for Twitter posting order

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript
- **UI Components**: Radix UI primitives via shadcn/ui for accessibility
- **Styling**: TailwindCSS with PostCSS for utility-first styling
- **Image Processing**: JSZip for file compression, Canvas API for image manipulation
- **File Handling**: react-dropzone for drag-and-drop file uploads
- **State Management**: TanStack Query for async state management
- **Form Handling**: React Hook Form with Zod validation

### Development Dependencies
- **Build Tools**: Vite for development, ESBuild for production
- **Database**: Drizzle ORM with PostgreSQL support (currently using in-memory storage)
- **Development**: tsx for TypeScript execution, various type definitions

## Deployment Strategy

### Replit Configuration
- **Environment**: Node.js 20, Web, PostgreSQL 16 modules
- **Development**: `npm run dev` starts both frontend and backend with hot reload
- **Production Build**: `npm run build` creates optimized client and server builds
- **Deployment**: Autoscale deployment target with automatic builds

### Build Process
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: ESBuild bundles Express server to `dist/index.js`
3. **Static Serving**: Production server serves client files and API routes

### Database Integration
- **Current**: In-memory storage for development
- **Future**: PostgreSQL with Drizzle ORM (infrastructure ready)
- **Schema**: User management schema defined but not yet implemented

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.