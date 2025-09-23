import type { ReactNode } from "react";
import { ArrowLeft } from "@/assets/icons";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";

interface TitleSubtitleProps {
  title?: ReactNode | string;
  subtitle?: ReactNode | string;
  backButton?: boolean;
  onBackClick?: () => void;
  children?: ReactNode;
  className?: string;
}

export default function TitleSubtitle({
  title,
  subtitle,
  backButton = false,
  onBackClick,
  children,
  className,
}: TitleSubtitleProps) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center text-onSurface justify-between mb-4 gap-2", className)}>
      <div className="flex flex-row gap-2 items-start min-w-fit">
        {backButton && (
          <button 
            className="cursor-pointer p-1 hover:bg-hover rounded"
            onClick={handleBackClick}
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
          </button>
        )}

        <div className="flex flex-col gap-1.5">
          {title && <div className="title-medium font-semibold">{title}</div>}
          {subtitle && (
            <div className="label-medium text-onSurfaceVariant">{subtitle}</div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
}
