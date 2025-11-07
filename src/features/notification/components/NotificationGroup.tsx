import { NotificationItem } from "./NotificationItem";
import type { NotificationGroup as NotificationGroupType } from "../types";
import { describeGroupDate } from "../utils/notificationUtils";

interface NotificationGroupProps {
  group: NotificationGroupType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationGroup = ({ group, onMarkAsRead, onDelete }: NotificationGroupProps) => (
  <section className="space-y-3">
    <header className="flex items-center gap-3">
      <h3 className="text-sm font-semibold text-onSurface">{describeGroupDate(group.date)}</h3>
      <div className="h-px flex-1 bg-outlineVariant" />
    </header>

    <div className="space-y-2">
      {group.notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  </section>
);
