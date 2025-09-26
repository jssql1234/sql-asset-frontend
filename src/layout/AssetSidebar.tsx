import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/utils/utils';
import AssetLogo from '@/components/AssetLogo';
import { Button } from '@/components/ui/components';
import { ChevronDown, ChevronUp, Sidebar as SidebarIcon } from '@/assets/icons';
import { SIDEBAR_SECTIONS, getPageTitle,} from './AssetSidebar.config';
import type { SidebarItem, SidebarItemId, SidebarSection } from './AssetSidebar.config';

let persistedExpandedSections: string[] | null = null;

const getItemIdFromPath = (pathname: string): SidebarItemId | null => {
  for (const section of SIDEBAR_SECTIONS) {
    for (const item of section.items) {
      if ('href' in item && item.href === pathname) return item.id;
    }
  }
  return null;
};

const ensureSectionIncluded = (
  sections: string[],
  sectionToInclude: string | null
): string[] => {
  if (!sectionToInclude) {
    return sections;
  }
  return sections.includes(sectionToInclude)
    ? sections
    : [...sections, sectionToInclude];
};

const findSectionTitleByItemId = (itemId: SidebarItemId | null): string | null => {
  if (!itemId) {
    return null;
  }

  const matchedSection = SIDEBAR_SECTIONS.find((section) =>
    section.items.some((sectionItem) => sectionItem.id === itemId)
  );

  return matchedSection?.title || null;
};

// Sidebar Item Component
interface SidebarItemProps {
  item: SidebarItem;
  isActive: boolean;
  onClick: (item: SidebarItem) => void;
}

const SidebarItemComponent: React.FC<SidebarItemProps> = ({ item, isActive, onClick }) => {
  const navigate = useNavigate();
  const IconComponent = item.icon;

  const handleClick = () => {
    onClick(item);
    if (item.href) {
      navigate(item.href);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <Button
      type="button"
      variant="link"
      onClick={handleClick}
      data-page={item.id}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "w-full h-9 px-4 py-2 justify-start rounded-none text-left label-small hover:no-underline",
        "bg-transparent transition-colors duration-150 border-l-[3px] border-l-transparent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        isActive
          ? "bg-primaryContainer text-onPrimaryContainer border-l-primary"
          : "text-onSurface hover:bg-hover"
      )}
    >
      <div className="flex items-center gap-3">
        {IconComponent ? <IconComponent size={16} className="text-onSurfaceVariant" /> : null}
        <span className="truncate">{item.label}</span>
      </div>
    </Button>
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
  <Button
    type="button"
    variant="secondary"
    onClick={onClick}
    aria-expanded={isExpanded}
    className={cn(
      "w-full h-9 px-4 py-2 justify-between rounded-none border-b border-outline label-medium-bold",
      "bg-surface text-onSurface hover:bg-hover hover:no-underline",
      !isFirst && "mt-2.5"
    )}
  >
    <span className="truncate font-bold">{title}</span>
    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  </Button>
);

// Main Sidebar Component
interface AssetSidebarProps {
  activeItem?: SidebarItemId;
  onItemSelect?: (item: SidebarItem) => void;
  className?: string;
}

const AssetSidebar: React.FC<AssetSidebarProps> = ({ 
  activeItem, 
  onItemSelect,
  className 
}) => {
  const location = useLocation();
  const detectedItemFromPath = getItemIdFromPath(location.pathname) ?? null;

  const initialSelectedItem = activeItem ?? detectedItemFromPath ?? null;
  const [selectedItem, setSelectedItem] = useState<SidebarItemId | null>(initialSelectedItem);
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const initialSectionTitle = findSectionTitleByItemId(initialSelectedItem);
    if (persistedExpandedSections && persistedExpandedSections.length > 0) {
      return ensureSectionIncluded(persistedExpandedSections, initialSectionTitle);
    }
    return initialSectionTitle ? [initialSectionTitle] : [];
  });

  // Auto-detect active item from current route
  useEffect(() => {
    const detectedItem = getItemIdFromPath(location.pathname);
    if (detectedItem && detectedItem !== selectedItem) {
      setSelectedItem(detectedItem);
    }
  }, [location.pathname, selectedItem]);

  // Update selected item when activeItem prop changes
  useEffect(() => {
    if (activeItem) {
      setSelectedItem(activeItem);
    }
  }, [activeItem]);

  const handleItemClick = (item: SidebarItem) => {
    const nextItemId = item.id as SidebarItemId;
    setSelectedItem(nextItemId);
    onItemSelect?.(item);
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((sectionTitle) => sectionTitle !== title)
        : [...prev, title]
    );
  };

  useEffect(() => {
    persistedExpandedSections = expandedSections;
  }, [expandedSections]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }
    const sectionTitle = findSectionTitleByItemId(selectedItem);
    if (!sectionTitle) {
      return;
    }
    setExpandedSections((prev) => {
      if (prev.includes(sectionTitle)) {
        return prev;
      }
      return [...prev, sectionTitle];
    });
  }, [selectedItem]);

  return (
    <div className={cn(
      "flex flex-col w-58 h-full bg-surface border-r border-outline overflow-hidden",
      className
    )}>
      <div className="flex flex-col overflow-y-auto min-h-0">
        {SIDEBAR_SECTIONS.map((section, sectionIndex) => (
          <div key={section.title || `section-${sectionIndex}`}>
            {section.title && (
              <SidebarHeader 
                title={section.title} 
                isFirst={sectionIndex === 0}
                isExpanded={expandedSections.includes(section.title)}
                onClick={() => toggleSection(section.title)}
              />
            )}
            {(section.title ? expandedSections.includes(section.title) : true) && section.items.map((item) => (
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
  activeSidebarItem?: SidebarItemId;
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
  const pageTitle = activeSidebarItem ? getPageTitle(activeSidebarItem) : 'SQL Asset';

  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      <div className="flex items-center gap-5 px-4 py-0 border-b border-outline bg-surface shadow-sm">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleSidebarToggle}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="rounded-md"
        >
          <SidebarIcon size={20} className="text-onSurface" />
        </Button>
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
export { AssetSidebar, ContentArea, AssetLayout };
export type { AssetLayoutProps, AssetSidebarProps, ContentAreaProps, SidebarItem, SidebarItemId, SidebarSection,};
