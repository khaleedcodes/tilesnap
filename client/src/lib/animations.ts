/**
 * Framer Motion Animation Utilities for TileSnap
 *
 * This file contains reusable animation variants and utilities
 * that maintain the cartoon-friendly aesthetic while being
 * accessible and performant.
 */

import { Variants, Transition } from "framer-motion";

// Respect user's motion preferences
export const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Base transition settings - bouncy and cartoon-friendly
export const cartoonTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const quickTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 0.6,
};

export const smoothTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: cartoonTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: smoothTransition,
  },
};

// Button animation variants
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    transition: quickTransition,
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.1 },
  },
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)",
    transition: quickTransition,
  },
};

// Card animation variants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: cartoonTransition,
  },
  hover: {
    y: -4,
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)",
    transition: quickTransition,
  },
};

// Modal/Dialog animation variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: cartoonTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: smoothTransition,
  },
};

// Backdrop animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: smoothTransition,
  },
  exit: {
    opacity: 0,
    transition: smoothTransition,
  },
};

// Stagger animation for multiple elements
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: cartoonTransition,
  },
};

// Loading animation variants
export const loadingVariants: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: cartoonTransition,
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: smoothTransition,
  },
};

// Bounce animation for success states
export const bounceVariants: Variants = {
  initial: { scale: 1 },
  bounce: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.4, 1],
      ease: "easeInOut",
    },
  },
};

// Progress bar animation
export const progressVariants: Variants = {
  initial: { width: "0%" },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// Image upload animation
export const uploadVariants: Variants = {
  idle: {
    borderColor: "rgb(209, 213, 219)", // gray-300
    backgroundColor: "rgb(249, 250, 251)", // gray-50
  },
  dragOver: {
    borderColor: "rgb(59, 130, 246)", // blue-500
    backgroundColor: "rgb(239, 246, 255)", // blue-50
    scale: 1.02,
    transition: quickTransition,
  },
  uploading: {
    borderColor: "rgb(16, 185, 129)", // green-500
    backgroundColor: "rgb(236, 253, 245)", // green-50
    scale: 1.01,
    transition: cartoonTransition,
  },
};

/**
 * Utility function to create accessible animations
 * Automatically reduces motion if user prefers it
 */
export const createAccessibleVariants = (variants: Variants): Variants => {
  if (reduceMotion()) {
    // Return simplified variants for reduced motion
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = {
        transition: { duration: 0.01 },
      };
      return acc;
    }, {} as Variants);
  }
  return variants;
};

/**
 * Spring animation presets for different use cases
 */
export const springPresets = {
  gentle: { stiffness: 120, damping: 20, mass: 1 },
  bouncy: { stiffness: 300, damping: 30, mass: 0.8 },
  snappy: { stiffness: 400, damping: 40, mass: 0.6 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
};
