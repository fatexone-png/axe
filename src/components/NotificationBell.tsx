"use client";

import { useEffect, useState, useRef } from "react";
import { getNotificationsByUser, markNotificationRead, markAllNotificationsRead } from "@/lib/firestore";
import { AppNotification } from "@/lib/types";
import Link from "next/link";

const TYPE_ICONS: Record<string, string> = {
  new_booking: "📅",
  payment_released: "💸",
  cancellation: "❌",
  invoice_sent: "📄",
};

function timeAgo(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  return `Il y a ${Math.floor(hrs / 24)}j`;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    getNotificationsByUser(userId).then(setNotifications).catch(() => {});
  }, [userId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function handleOpen() {
    setOpen((prev) => !prev);
  }

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  async function handleMarkAll() {
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5 text-axe-muted">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-axe-accent text-axe-black text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-axe-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-axe-white font-semibold text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-axe-muted hover:text-axe-accent transition-colors">
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-axe-muted text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 15).map((n) => {
                const date = n.createdAt instanceof Date
                  ? n.createdAt
                  : (n.createdAt as { toDate?: () => Date }).toDate?.() ?? new Date();
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors ${!n.read ? "bg-axe-accent/5" : ""}`}
                    onClick={() => { if (!n.read && n.id) handleMarkRead(n.id); }}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${n.read ? "text-axe-muted" : "text-axe-white"}`}>{n.title}</p>
                      <p className="text-xs text-axe-muted mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                      <p className="text-xs text-axe-muted/60 mt-1">{timeAgo(date)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-axe-accent shrink-0 mt-1.5" />}
                  </div>
                );
              })
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-white/5 px-4 py-2.5 text-center">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xs text-axe-muted hover:text-axe-accent transition-colors">
                Voir mon espace →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
