import React from 'react';
import { cn } from '@/utils/utils';
import type { WorkRequestAsset } from '@/types/work-request';

interface AssetTagsProps {
  assets: WorkRequestAsset[];
  onRemove?: (assetCode: string) => void;
  readonly?: boolean;
  className?: string;
}

export const AssetTags: React.FC<AssetTagsProps> = ({
  assets,
  onRemove,
  readonly = false,
  className
}) => {
  if (assets.length === 0) {
    return (
      <div className={cn('text-onSurfaceVariant text-sm italic', className)}>
        No assets selected
      </div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {assets.map((asset) => (
        <div 
          key={asset.main.code} 
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors',
            readonly 
              ? 'bg-gray-100 text-gray-700' 
              : 'bg-blue-500 text-white'
          )}
        >
          <span>{asset.main.code}</span>
          {!readonly && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(asset.main.code)}
              className="w-4 h-4 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-white text-xs transition-colors ml-1"
              aria-label={`Remove ${asset.main.code}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};