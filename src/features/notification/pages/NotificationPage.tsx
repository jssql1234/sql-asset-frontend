import { useState } from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Card } from "@/components/ui/components";
import TabHeader from "@/components/TabHeader";
import Search from "@/components/Search";
import { NotificationGroup } from "../components/NotificationGroup";
import { CheckCheck, Trash2 } from "lucide-react";
import type { NotificationFilters } from "../types";
import { useNotifications } from "../hooks/useNotifications";

const NotificationPage = () => {
  const [filters, setFilters] = useState<NotificationFilters>({
    search: "",
    type: "",
    priority: "",
    status: "",
  });

  const {
    notifications,
    filteredNotifications,
    groupedNotifications,
    unreadCount,
    filteredUnreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleClearAll,
  } = useNotifications(filters);

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Dashboard" },
        { label: "Notifications" },
      ]}
    >
      <div className="flex flex-col gap-6 px-4 pb-4">
        <TabHeader
          title="Notifications"
          subtitle="View and manage all system notifications"
          actions={[
            {
              label: `Mark All as Read (${String(filteredUnreadCount)})`,
              onAction: handleMarkAllAsRead,
              disabled: filteredUnreadCount === 0,
              icon: <CheckCheck className="size-4" />,
            },
            {
              label: "Clear All",
              onAction: handleClearAll,
              disabled: notifications.length === 0,
              icon: <Trash2 className="size-4" />,
              variant: "destructive",
            },
          ]}
        />

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Search
                searchValue={filters.search ?? ""}
                searchPlaceholder="Search notifications..."
                onSearch={(value) => {
                  handleFilterChange("search", value);
                }}
                live={true}
                showLiveSearchIcon={true}
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <Card className="p-6 border border-outline bg-surfaceContainer">
          {groupedNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCheck className="size-12 mx-auto text-onSurfaceVariant opacity-50 mb-3" />
                <h3 className="text-lg font-medium text-onSurface mb-1">No Notifications</h3>
                <p className="text-sm text-onSurfaceVariant">
                  {filters.search || filters.type || filters.priority || filters.status
                    ? "No notifications match your filters"
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedNotifications.map((group) => (
                <NotificationGroup
                  key={group.date}
                  group={group}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between text-sm text-onSurfaceVariant">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            {unreadCount > 0 && (
              <span className="font-medium text-primary">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationPage;
