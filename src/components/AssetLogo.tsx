import React from "react";
import sqlLogo from "@/assets/images/sqlasset_logo2.png";

interface AssetLogoProps {
  className?: string;
  title?: string;
}

const AssetLogo: React.FC<AssetLogoProps> = ({ className = "", title = "SQL Asset" }) => {
  return (
    <div className={`flex items-center gap-9 ${className}`}>
      <img
        src={sqlLogo}
        alt="SQL Asset Logo"
        className="h-15 w-15 object-contain"
      />
      <span className="title-small text-onSurface font-semibold">
        {title}
      </span>
    </div>
  );
};

export default AssetLogo;
