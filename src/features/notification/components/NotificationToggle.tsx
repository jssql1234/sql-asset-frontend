import { cn } from "@/utils/utils";

interface NotificationToggleProps {
  activeTab: "all" | "unread";
  onTabChange: (tab: "all" | "unread") => void;
}

export const NotificationToggle = ({ activeTab, onTabChange }: NotificationToggleProps) => {
  return (
    <div className="relative flex items-center bg-gray-100 rounded-full p-1">
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
        onClick={() => {
          onTabChange("all");
        }}
        className={cn(
          "relative z-10 flex-1 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full",
          activeTab === "all" ? "text-white" : "text-gray-600"
        )}
        aria-pressed={activeTab === "all"}
      >
        All
      </button>
      
      {/* Unread Button */}
      <button
        type="button"
        onClick={() => {
          onTabChange("unread");
        }}
        className={cn(
          "relative z-10 flex-1 px-6 py-2.5 text-sm font-medium transition-colors duration-200 rounded-full",
          activeTab === "unread" ? "text-white" : "text-gray-600"
        )}
        aria-pressed={activeTab === "unread"}
      >
        Unread
      </button>
    </div>
  );
};
