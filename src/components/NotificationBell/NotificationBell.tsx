"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, getAccessToken } from "@/utils/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  application_id: string | null;
  applicant_id: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await api.getUnreadNotificationCount();
      setUnreadCount(data.count);
    } catch {
      // silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // SSE listener for real-time notifications
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const streamUrl = api.getNotificationStreamUrl();
    const es = new EventSource(`${streamUrl}?token=${encodeURIComponent(token)}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "notification" && payload.data) {
          setNotifications((prev) => [payload.data, ...prev].slice(0, 50));
          setUnreadCount((prev) => prev + 1);
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen) {
      await fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await api.markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // silently fail
      }
    }
    if (notification.application_id) {
      setOpen(false);
      router.push(`/dashboard/applications/${notification.application_id}`);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className="flex items-center justify-center"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "1px solid #D9D9D9",
          background: "transparent",
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Bell style={{ width: "20px", height: "20px", color: "#575757" }} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#DF1C41",
              border: "2px solid #FFFFFF",
              animation: "pulse 1.5s infinite",
            }}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "48px",
            right: 0,
            width: "360px",
            maxHeight: "480px",
            background: "#FFFFFF",
            border: "1px solid #D9D9D9",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between"
            style={{ padding: "16px", borderBottom: "1px solid #F0F0F0" }}
          >
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#0F0F0F" }}>
              Notifications
            </span>
            <div className="flex items-center" style={{ gap: "8px" }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "#2D76B5",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X style={{ width: "16px", height: "16px", color: "#575757" }} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#73757C", fontSize: "14px" }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#73757C", fontSize: "14px" }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="flex items-start"
                  style={{
                    padding: "12px 16px",
                    gap: "12px",
                    cursor: "pointer",
                    borderBottom: "1px solid #F0F0F0",
                    background: notification.is_read ? "transparent" : "#EFF4F9",
                  }}
                >
                  {/* Unread dot */}
                  <div style={{ paddingTop: "4px", flexShrink: 0 }}>
                    {!notification.is_read && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#DF1C41",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#0F0F0F",
                        margin: 0,
                        lineHeight: "1.4",
                      }}
                    >
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p
                        style={{
                          fontSize: "13px",
                          fontWeight: 400,
                          color: "#575757",
                          margin: "4px 0 0 0",
                          lineHeight: "1.4",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notification.message}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: "11px",
                        fontWeight: 400,
                        color: "#73757C",
                        margin: "4px 0 0 0",
                      }}
                    >
                      {formatTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
