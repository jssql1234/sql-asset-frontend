import React from "react";
import sqlLogo from "@/assets/images/sql_logo.png";

interface AssetLogoProps {
  className?: string;
}

const AssetLogo: React.FC<AssetLogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <img
        src={sqlLogo}
        alt="SQL Asset Logo"
        className="h-[90px] w-[90px] object-contain"
      />
      <span className="title-large text-onSurface font-semibold">Asset</span>
    </div>
  );
};

export default AssetLogo;
