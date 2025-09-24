import React from "react";
import sqlLogo from "@/assets/images/sql_logo.png";

interface AssetLogoProps {
  className?: string;
}

const AssetLogo: React.FC<AssetLogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={sqlLogo}
        alt="SQL Asset Logo"
        className="h-12 w-12 object-contain"
      />
      <span className="title-small text-onSurface font-semibold">
        SQL Asset
      </span>
    </div>
  );
};

export default AssetLogo;
