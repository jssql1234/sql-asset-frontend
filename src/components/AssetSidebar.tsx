import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/utils/utils';
import AssetLogo from '@/components/AssetLogo';
import { ChevronDown, ChevronUp, Sidebar as SidebarIcon } from '@/assets/icons';

// Page title mapping based on sidebar item IDs
const PAGE_TITLES: Record<string, string> = {
  asset: 'Asset List',
  'process-ca': 'Process CA',
  dashboard: 'Dashboard',
  'maintenance-schedule': 'Maintenance Schedule',
  'work-request': 'Work Requests',
  allocation: 'Asset Allocation',
  'downtime-tracking': 'Downtime Records',
  insurance: 'Insurance & Warranty Claims',
  'meter-reading': 'Meter Reading',
  'user-group-management': 'User Group Management',
  'user-access-rights': 'User Access Rights',
  'maintenance-pic': 'Maintain User',
  'maintenance-spare-parts': 'Maintain Spare Part',
  'maintenance-in-house-labors': 'Maintain In-House Labor',
  'maintenance-outsourced-vendors': 'Maintain Outsourced Vendor',
  'maintenance-locations': 'Maintain Location',
  'maintenance-departments': 'Maintain Department',
  'maintenance-location-types': 'Maintain Location Type',
  'maintenance-vendors': 'Maintain Vendor',
  'maintenance-assetGroup': 'Maintain Asset Group',
  'asset-history': 'Asset History',
  options: 'Options'
};

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
const HOME_ITEM: SidebarItem = {
  id: "asset",
  label: "Asset List",
  href: "/asset"
};

const SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    title: "Tax Computation",
    items: [
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
  },
  {
    title: "Tools",
    items: [
      {
        id: "user-group-management",
        label: "User Group Management",
        href: "/user-group-management"
      },
      {
        id: "user-access-rights",
        label: "User Access Rights",
        href: "/user-access-rights"
      },
      {
        id: "maintenance-pic",
        label: "Maintain User...",
        href: "/maintenance-PIC"
      },
      {
        id: "maintenance-spare-parts",
        label: "Maintain Spare Part...",
        href: "/maintenance-spare-parts"
      },
      {
        id: "maintenance-in-house-labors",
        label: "Maintain In-House Labor...",
        href: "/maintenance-in-house-labors"
      },
      {
        id: "maintenance-outsourced-vendors",
        label: "Maintain Outsourced Vendor...",
        href: "/maintenance-outsourced-vendors"
      },
      {
        id: "maintenance-locations",
        label: "Maintain Location...",
        href: "/maintenance-locations"
      },
      {
        id: "maintenance-departments",
        label: "Maintain Department...",
        href: "/maintenance-departments"
      },
      {
        id: "maintenance-location-types",
        label: "Maintain Location Type...",
        href: "/maintenance-location-types"
      },
      {
        id: "maintenance-vendors",
        label: "Maintain Vendor...",
        href: "/maintenance-vendors"
      },
      {
        id: "maintenance-assetGroup",
        label: "Maintain Asset Group...",
        href: "/maintenance-assetGroup"
      },
      {
        id: "asset-history",
        label: "Asset History",
        href: "/asset-history"
      },
      {
        id: "options",
        label: "Options",
        onClick: () => console.log("Opening options sub-window")
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
  isExpanded: boolean;
  onClick: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, isFirst = false, isExpanded, onClick }) => (
  <div className={cn(
    "px-4 py-2 h-9 border-b border-outline cursor-pointer hover:bg-hover",
    !isFirst && "mt-2.5"
  )} onClick={onClick}>
    <div className="flex items-center justify-between">
      <div className="label-medium-bold text-onSurface break-words">
        {title}
      </div>
      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Asset Listing', 'Asset Maintenance', 'Tools']));

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
      '/meter-reading': 'meter-reading',
      '/user-group-management': 'user-group-management',
      '/user-access-rights': 'user-access-rights',
      '/maintenance-PIC': 'maintenance-pic',
      '/maintenance-spare-parts': 'maintenance-spare-parts',
      '/maintenance-in-house-labors': 'maintenance-in-house-labors',
      '/maintenance-outsourced-vendors': 'maintenance-outsourced-vendors',
      '/maintenance-locations': 'maintenance-locations',
      '/maintenance-departments': 'maintenance-departments',
      '/maintenance-location-types': 'maintenance-location-types',
      '/maintenance-vendors': 'maintenance-vendors',
      '/maintenance-assetGroup': 'maintenance-assetGroup',
      '/asset-history': 'asset-history'
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

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  return (
    <div className={cn(
      "flex flex-col w-58 h-full bg-surface border-r border-outline overflow-hidden",
      className
    )}>
      <div className="flex flex-col overflow-y-auto min-h-0">
        <SidebarItemComponent
          key={HOME_ITEM.id}
          item={HOME_ITEM}
          isActive={selectedItem === HOME_ITEM.id}
          onClick={handleItemClick}
        />
        {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
          <div key={section.title}>
            <SidebarHeader 
              title={section.title} 
              isFirst={sectionIndex === 0}
              isExpanded={expandedSections.has(section.title)}
              onClick={() => toggleSection(section.title)}
            />
            {expandedSections.has(section.title) && section.items.map((item) => (
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
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSidebarToggle = () => setIsSidebarOpen((prev) => !prev);

  // Determine page title based on active sidebar item
  const pageTitle = activeSidebarItem ? PAGE_TITLES[activeSidebarItem] || 'SQL Asset' : 'SQL Asset';

  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      <div className="flex items-center gap-5 px-4 py-3 border-b border-outline bg-surface shadow-sm">
        <button
          type="button"
          onClick={handleSidebarToggle}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "p-2 rounded-md transition-colors",
            "hover:bg-hover focus:outline-none focus:ring-2 focus:ring-primary"
          )}
        >
          <SidebarIcon size={20} className="text-onSurface" />
        </button>
        <AssetLogo title={pageTitle} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <AssetSidebar
            activeItem={activeSidebarItem}
            onItemSelect={onSidebarItemSelect}
            className="flex-shrink-0"
          />
        )}
        <ContentArea className="flex-1">
          {children}
        </ContentArea>
      </div>
    </div>
  );
};

export default AssetSidebar;
export { AssetSidebar, ContentArea, AssetLayout, SIDEBAR_SECTIONS };
export type { SidebarItem, SidebarSection, AssetSidebarProps, ContentAreaProps, AssetLayoutProps };
