import React from "react";
import { useNavigate } from "react-router-dom";
import sqlLogo from "@/assets/images/sqlasset_logo2.png";

interface AssetLogoProps {
  className?: string;
  title?: string;
}

const AssetLogo: React.FC<AssetLogoProps> = ({ className = "", title = "SQL Asset" }) => {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center gap-20 cursor-pointer ${className}`} onClick={() => navigate('/asset')}>
      <img
        src={sqlLogo}
        alt="SQL Asset Logo"
        className="h-15 w-15 object-contain"
      />
      <span className="title-medium text-onSurface font-semibold">
        {title}
      </span>
    </div>
  );
};

export default AssetLogo;
