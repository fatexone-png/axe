"use client";

import { useMemo } from "react";
import { Booking } from "@/lib/types";

interface Props {
  bookings: Booking[];
  averageRating?: number;
  reviewCount?: number;
}

function fmtEuros(cents: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function DashboardAnalytics({ bookings, averageRating, reviewCount }: Props) {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

    const released = bookings.filter((b) => b.status === "released");
    const totalRevenueCents = released.reduce((s, b) => s + b.proPayoutCents, 0);
    const monthRevenueCents = released.filter((b) => b.sessionDate >= monthStart).reduce((s, b) => s + b.proPayoutCents, 0);
    const totalSessions = released.length;
    const monthSessions = released.filter((b) => b.sessionDate >= monthStart).length;
    const pendingCount = bookings.filter((b) => b.status === "paid" || b.status === "session_confirmed").length;
    const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

    // Revenue by month (last 6 months)
    const monthlyRevenue: { label: string; cents: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(d);
      const cents = released
        .filter((b) => b.sessionDate.startsWith(key))
        .reduce((s, b) => s + b.proPayoutCents, 0);
      monthlyRevenue.push({ label, cents });
    }

    // Top services
    const serviceCounts: Record<string, number> = {};
    for (const b of released) {
      serviceCounts[b.sessionType] = (serviceCounts[b.sessionType] ?? 0) + 1;
    }
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    return { totalRevenueCents, monthRevenueCents, totalSessions, monthSessions, pendingCount, cancelledCount, monthlyRevenue, topServices };
  }, [bookings]);

  const maxCents = Math.max(...stats.monthlyRevenue.map((m) => m.cents), 1);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-axe-muted mb-1">CA total versé</p>
          <p className="text-xl font-bold text-axe-accent">{fmtEuros(stats.totalRevenueCents)}</p>
        </div>
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-axe-muted mb-1">CA ce mois</p>
          <p className="text-xl font-bold text-green-400">{fmtEuros(stats.monthRevenueCents)}</p>
        </div>
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-axe-muted mb-1">Séances réalisées</p>
          <p className="text-xl font-bold text-axe-white">{stats.totalSessions}</p>
          <p className="text-xs text-axe-muted mt-0.5">{stats.monthSessions} ce mois</p>
        </div>
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-axe-muted mb-1">Note moyenne</p>
          {averageRating ? (
            <>
              <p className="text-xl font-bold text-axe-amber">★ {averageRating.toFixed(1)}</p>
              <p className="text-xs text-axe-muted mt-0.5">{reviewCount} avis</p>
            </>
          ) : (
            <p className="text-xl font-bold text-axe-muted">—</p>
          )}
        </div>
      </div>

      {/* Graphique CA mensuel */}
      <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5">
        <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider mb-5">CA mensuel (6 derniers mois)</p>
        <div className="flex items-end gap-2 h-32">
          {stats.monthlyRevenue.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <p className="text-[10px] text-axe-muted">{m.cents > 0 ? fmtEuros(m.cents) : ""}</p>
              <div className="w-full rounded-t-lg bg-axe-accent/20 relative overflow-hidden" style={{ height: "80px" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-axe-accent rounded-t-lg transition-all duration-500"
                  style={{ height: `${Math.round((m.cents / maxCents) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-axe-muted capitalize">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top prestations */}
      {stats.topServices.length > 0 && (
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5">
          <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider mb-4">Prestations les plus demandées</p>
          <div className="space-y-2">
            {stats.topServices.map(([name, count], i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xs text-axe-muted w-4 shrink-0">{i + 1}.</span>
                <div className="flex-1 bg-axe-dark rounded-lg overflow-hidden h-6 relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-axe-accent/20 rounded-lg"
                    style={{ width: `${Math.round((count / (stats.topServices[0]?.[1] ?? 1)) * 100)}%` }}
                  />
                  <span className="relative px-3 text-xs text-axe-white leading-6">{name}</span>
                </div>
                <span className="text-xs text-axe-white font-semibold shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statuts */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-axe-amber/10 flex items-center justify-center shrink-0">
            <span className="text-axe-amber text-sm font-bold">{stats.pendingCount}</span>
          </div>
          <p className="text-axe-muted text-sm">Réservations en attente de confirmation</p>
        </div>
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <span className="text-red-400 text-sm font-bold">{stats.cancelledCount}</span>
          </div>
          <p className="text-axe-muted text-sm">Annulations</p>
        </div>
      </div>
    </div>
  );
}
