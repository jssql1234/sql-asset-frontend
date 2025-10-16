import { useEffect } from "react";

/**
 * Custom hook to prevent body scrolling when a modal/dialog is open.
 * Also prevents layout shift by calculating and compensating for scrollbar width.
 * 
 * @param isOpen - Boolean indicating if the modal/dialog is open
 * 
 * @example
 * ```tsx
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * usePreventBodyScroll(isModalOpen);
 * ```
 */
export const usePreventBodyScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Store original values
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      // Add padding to compensate for scrollbar width (if scrollbar exists)
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        // Restore original values when modal closes
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);
};
