import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { MenuBar } from './MenuBar';

// Types for sidebar navigation
interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

// Sidebar navigation data as constants
const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Asset Listing",
    items: [
      {
        id: "asset",
        label: "Maintain Asset",
        href: "/asset"
      },
      {
        id: "process-ca",
        label: "Process CA",
        href: "/process-ca"
      }
    ]
  },
  {
    title: "Asset Maintenance",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/dashboard"
      },
      {
        id: "maintenance-schedule",
        label: "Maintenance Schedule",
        href: "/maintenance-schedule"
      },
      {
        id: "work-request",
        label: "Work Requests",
        href: "/work-request"
      },
      {
        id: "allocation",
        label: "Allocation",
        href: "/allocation"
      },
      {
        id: "downtime-tracking",
        label: "Downtime Records",
        href: "/downtime-tracking"
      },
      {
        id: "insurance",
        label: "Insurance & Warranty Claims",
        href: "/insurance"
      },
      {
        id: "meter-reading",
        label: "Meter Reading",
        href: "/meter-reading"
      }
    ]
  }
];

// Sidebar Item Component
interface SidebarItemProps {
  item: SidebarItem;
  isActive: boolean;
  onClick: (item: SidebarItem) => void;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({ item, isActive, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onClick(item);
    if (item.href) {
      navigate(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div
      className={cn(
        "h-9 px-4 py-2 cursor-pointer transition-colors duration-150",
        "hover:bg-hover",
        isActive && "bg-primaryContainer pl-3 border-l-3 border-primary"
      )}
      onClick={handleClick}
      data-page={item.id}
    >
      <div className={cn(
        "flex justify-center flex-col break-words",
        "label-small",
        isActive ? "text-onPrimaryContainer" : "text-onSurface"
      )}>
        {item.label}
      </div>
    </div>
  );
};

// Sidebar Header Component
interface SidebarHeaderProps {
  title: string;
  isFirst?: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, isFirst = false }) => (
  <div className={cn(
    "px-4 py-2 h-9 border-b border-outline",
    !isFirst && "mt-2.5"
  )}>
    <div className="label-medium-bold text-onSurface align-center break-words">
      {title}
    </div>
  </div>
);

// Main Sidebar Component
interface AssetSidebarProps {
  activeItem?: string;
  onItemSelect?: (item: SidebarItem) => void;
  className?: string;
}

const AssetSidebar: React.FC<AssetSidebarProps> = ({ 
  activeItem, 
  onItemSelect,
  className 
}) => {
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string>(activeItem || '');

  // Auto-detect active item from current route
  useEffect(() => {
    const currentPath = location.pathname;
    const pathToIdMap: Record<string, string> = {
      '/asset': 'asset',
      '/process-ca': 'process-ca',
      '/modify-re': 'modify-re',
      '/dashboard': 'dashboard',
      '/maintenance-schedule': 'maintenance-schedule',
      '/work-request': 'work-request',
      '/allocation': 'allocation',
      '/downtime-tracking': 'downtime-tracking',
      '/insurance': 'insurance',
      '/meter-reading': 'meter-reading'
    };

    const detectedItem = pathToIdMap[currentPath];
    if (detectedItem) {
      setSelectedItem(detectedItem);
    }
  }, [location.pathname]);

  // Update selected item when activeItem prop changes
  useEffect(() => {
    if (activeItem) {
      setSelectedItem(activeItem);
    }
  }, [activeItem]);

  const handleItemClick = (item: SidebarItem) => {
    setSelectedItem(item.id);
    onItemSelect?.(item);
  };

  return (
    <div className={cn(
      "flex flex-col w-50 h-screen bg-surface border-r border-outline overflow-y-auto",
      className
    )}>
      {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
        <div key={section.title}>
          <SidebarHeader 
            title={section.title} 
            isFirst={sectionIndex === 0} 
          />
          {section.items.map((item) => (
            <SidebarItemComponent
              key={item.id}
              item={item}
              isActive={selectedItem === item.id}
              onClick={handleItemClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Content Area Component (reusable within the same file)
interface ContentAreaProps {
  children: React.ReactNode;
  className?: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ children, className }) => (
  <div className={cn(
    "flex-1 p-6 bg-background overflow-y-auto",
    className
  )}>
    {children}
  </div>
);

// Layout Component that combines Sidebar and Content Area
interface AssetLayoutProps {
  children: React.ReactNode;
  activeSidebarItem?: string;
  onSidebarItemSelect?: (item: SidebarItem) => void;
  className?: string;
}

const AssetLayout: React.FC<AssetLayoutProps> = ({
  children,
  activeSidebarItem,
  onSidebarItemSelect,
  className
}) => (
  <div className={cn("flex h-screen", className)}>
    <AssetSidebar 
      activeItem={activeSidebarItem}
      onItemSelect={onSidebarItemSelect}
    />
    <ContentArea>
      {children}
    </ContentArea>
  </div>
);

export default AssetSidebar;
export { AssetSidebar, ContentArea, AssetLayout, SIDEBAR_SECTIONS };
export type { SidebarItem, SidebarSection, AssetSidebarProps, ContentAreaProps, AssetLayoutProps };
