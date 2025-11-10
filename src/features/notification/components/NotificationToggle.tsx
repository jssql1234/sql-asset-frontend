import { cn } from "@/utils/utils";

interface NotificationToggleProps {
  activeTab: "all" | "unread";
  onTabChange: (tab: "all" | "unread") => void;
}

export const NotificationToggle = ({ activeTab, onTabChange }: NotificationToggleProps) => {
  const handleTabSelection = (tab: NotificationToggleProps["activeTab"]) => () => {
    if (tab !== activeTab) {
      onTabChange(tab);
    }
  };

  return (
    <div
      className="relative flex items-center bg-gray-100 rounded-full p-1"
      role="tablist"
      aria-label="Notification filter"
    >
      {/* Background slider */}
      <div
        className={cn(
          "absolute top-1 bottom-1 left-1 right-1 w-[calc(50%-4px)] bg-gray-900 rounded-full transition-transform duration-200 ease-out",
          activeTab === "unread" && "translate-x-[calc(100%+8px)]"
        )}
      />
      
      {/* All Button */}
      <button
        type="button"
        onClick={handleTabSelection("all")}
        className={cn(
          "relative z-10 flex-1 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full",
          activeTab === "all" ? "text-white" : "text-gray-600"
        )}
        role="tab"
        aria-selected={activeTab === "all"}
        tabIndex={activeTab === "all" ? 0 : -1}
      >
        All
      </button>
      
      {/* Unread Button */}
      <button
        type="button"
        onClick={handleTabSelection("unread")}
        className={cn(
          "relative z-10 flex-1 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full",
          activeTab === "unread" ? "text-white" : "text-gray-600"
        )}
        role="tab"
        aria-selected={activeTab === "unread"}
        tabIndex={activeTab === "unread" ? 0 : -1}
      >
        Unread
      </button>
    </div>
  );
};
