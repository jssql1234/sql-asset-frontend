import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubmenu,
} from "./ui/components";
import { Button } from "./ui/components";

interface MenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  submenu?: MenuItem[];
}

interface MenuBarProps {
  className?: string;
}

const MenuBar: React.FC<MenuBarProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Menu data structure based on the HTML
  const menuItems: MenuItem[] = [
    {
      label: "Home",
      href: "/asset",
    },
    {
      label: "Reports",
      submenu: [
        { label: "Allowance", href: "/allowance-schedule" },
        { label: "Depreciation", href: "/depreciation-schedule" },
        { label: "Disposal", href: "/disposal-schedule" },
        { label: "Hire Purchase", href: "/hire-purchase-schedule" },
      ],
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "User Management",
          submenu: [
            { label: "User Group Management", href: "/user-group-management" },
            { label: "User Access Rights", href: "/user-access-rights" },
            { label: "Maintain User...", href: "/maintenance-PIC" },
          ],
        },
        { label: "separator" }, // Divider
        { label: "Maintain Spare Part...", href: "/maintenance-spare-parts" },
        {
          label: "Maintain In-House Labor...",
          href: "/maintenance-in-house-labors",
        },
        {
          label: "Maintain Outsourced Vendor...",
          href: "/maintenance-outsourced-vendors",
        },
        { label: "separator" }, // Divider
        {
          label: "Location Management",
          submenu: [
            { label: "Maintain Location...", href: "/maintenance-locations" },
            {
              label: "Maintain Department...",
              href: "/maintenance-departments",
            },
            {
              label: "Maintain Location Type...",
              href: "/maintenance-location-types",
            },
          ],
        },
        { label: "Maintain Vendor...", href: "/maintenance-vendors" },
        { label: "separator" }, // Divider
        { label: "Maintain Asset Group...", href: "/maintenance-assetGroup" },
        { label: "separator" }, // Divider
        { label: "Asset History", href: "/asset-history" },
        { label: "separator" }, // Divider
        { label: "Options", onClick: () => openOptionsSubWindow() },
      ],
    },
    {
      label: "View",
      submenu: [],
    },
  ];

  // Helper functions to maintain compatibility with original functionality
  const openSubWindowWithReport = (reportName: string) => {
    console.log(`Opening sub-window with report: ${reportName}`);
    // Implementation for opening sub-window with report
  };

  const openOptionsSubWindow = () => {
    console.log("Opening options sub-window");
    // Implementation for opening options sub-window
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const renderDropdownItems = (
    items: MenuItem[],
    isNested = false
  ): React.ReactNode => {
    return items.map((item, index) => {
      // Handle separators/dividers
      if (item.label === "separator") {
        return <div key={index} className="h-px bg-outline my-2 mx-1" />;
      }

      if (item.submenu && item.submenu.length > 0) {
        return (
          <DropdownMenuSubmenu
            key={index}
            trigger={
              <div className="cursor-pointer px-0 py-0 flex items-center justify-between w-full">
                <span>{item.label}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-auto"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </div>
            }
            className="min-w-48"
          >
            {renderDropdownItems(item.submenu, true)}
          </DropdownMenuSubmenu>
        );
      }

      return (
        <DropdownMenuItem
          key={index}
          className="cursor-pointer"
          onClick={() => handleMenuItemClick(item)}
        >
          {item.label}
        </DropdownMenuItem>
      );
    });
  };

  const renderMenuItem = (item: MenuItem, index: number) => {
    if (item.submenu && item.submenu.length > 0) {
      return (
        <DropdownMenu key={index}>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              size="sm"
              className="bg-transparent label-medium text-onSurface hover:bg-gray-200 px-3 py-2 h-7 rounded-md transition-all duration-200 ease-in-out"
            >
              {item.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-72 bg-surface border border-outline shadow-md rounded-lg mt-1">
            {renderDropdownItems(item.submenu)}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Button
        key={index}
        variant="ghost"
        size="sm"
        className="bg-transparent label-medium text-onSurface hover:bg-gray-200 px-3 py-2 h-7 rounded-md transition-all duration-200 ease-in-out"
        onClick={() => handleMenuItemClick(item)}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <nav
      id="menu"
      className={`w-full bg-surface border-b border-outline shadow-sm ${className}`}
    >
      <div className="flex items-center h-7 px-2">
        {menuItems.map((item, index) => renderMenuItem(item, index))}
      </div>
    </nav>
  );
};

export { MenuBar };
export type { MenuBarProps, MenuItem };
