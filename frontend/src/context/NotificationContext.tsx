import {
  createContext,
  useContext,
  useState,
} from "react";

export interface Notification {
  id: number;
  type: "scan" | "breach" | "report";
  message: string;
  time: string;
}

interface ContextType {
  notifications: Notification[];
  addNotification: (
    type: Notification["type"],
    message: string
  ) => void;
}

const NotificationContext =
  createContext<ContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  function addNotification(
    type: Notification["type"],
    message: string
  ) {
    const notification = {
      id: Date.now(),
      type,
      message,
      time: new Date().toLocaleTimeString(),
    };

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context =
    useContext(NotificationContext);

  if (!context)
    throw new Error(
      "NotificationProvider missing"
    );

  return context;
}