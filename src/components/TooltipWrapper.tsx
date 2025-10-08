import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/utils';

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  content,
  position = 'top',
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    if (!isVisible || !wrapperRef.current || !tooltipRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = wrapperRect.top - tooltipRect.height - 8;
        left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = wrapperRect.bottom + 8;
        left = wrapperRect.left + (wrapperRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = wrapperRect.top + (wrapperRect.height / 2) - (tooltipRect.height / 2);
        left = wrapperRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = wrapperRect.top + (wrapperRect.height / 2) - (tooltipRect.height / 2);
        left = wrapperRect.right + 8;
        break;
    }

    // Clamp within viewport
    left = Math.max(8, Math.min(left, windowWidth - tooltipRect.width - 8));
    top = Math.max(8, Math.min(top, windowHeight - tooltipRect.height - 8));

    setTooltipPosition({ top, left });
  }, [isVisible, position]);

  return (
    <div
      ref={wrapperRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-2 py-1 bg-inverseSurface text-inverseOnSurface text-sm rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};