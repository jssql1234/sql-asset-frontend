import { useCallback, useEffect, useId, useRef, useState } from "react";

interface UseNotificationPanelOptions {
  readonly unreadCount: number;
}

interface UseNotificationPanelReturn {
  readonly isOpen: boolean;
  readonly panelId: string;
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useNotificationPanel = ({ unreadCount }: UseNotificationPanelOptions): UseNotificationPanelReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousUnreadRef = useRef(unreadCount);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((previous) => !previous);
  }, []);

  useEffect(() => {
    if (unreadCount > previousUnreadRef.current) {
      setIsOpen(true);
    }
    previousUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return {
    isOpen,
    panelId,
    containerRef,
    open,
    close,
    toggle,
  };
};
