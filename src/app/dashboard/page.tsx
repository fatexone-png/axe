"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getRequestsByEmail, getProfessionalByEmail } from "@/lib/firestore";
import { ClientRequest, Professional } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import RequestCard from "@/components/RequestCard";
import ProtectionDashboard from "@/components/ProtectionDashboard";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);

      const [reqs, proProfile] = await Promise.all([
        getRequestsByEmail(u.email!),
        getProfessionalByEmail(u.email!),
      ]);
      setRequests(reqs);
      setPro(proProfile);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-axe-white mb-1">Mon espace</h1>
          <p className="text-axe-muted text-sm">{user?.email}</p>
        </div>

        {/* Profil professionnel */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">
              Mon profil professionnel
            </h2>
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-axe-white text-lg">
                    {pro.firstName} {pro.lastName}
                  </p>
                  <p className="text-axe-accent text-sm">
                    {PROFESSION_LABELS[pro.profession] ?? pro.profession}
                  </p>
                  <p className="text-axe-muted text-xs mt-1">
                    {pro.city} · {pro.experienceYears} ans d&apos;expérience
                  </p>
                </div>
                <StatusBadge status={pro.status} />
              </div>

              {pro.status === "pending" && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    Votre profil est en cours de validation.
                    L&apos;équipe AXE reviendra vers vous sous 48h.
                  </p>
                </div>
              )}

              {pro.status === "approved" && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 text-sm">
                    Votre profil est approuvé. Vous faites partie du réseau AXE.
                  </p>
                </div>
              )}

              {pro.status === "rejected" && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-sm">
                    Votre profil n&apos;a pas été validé. Contactez-nous à contact@axe.fr pour plus d&apos;informations.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-3 text-xs text-axe-muted">
                <span>RC Pro : <strong className={pro.hasInsurance ? "text-green-400" : "text-red-400"}>{pro.hasInsurance ? "Oui" : "Non"}</strong></span>
                <span>Niveau : <StatusBadge status={pro.trustLevel} /></span>
                <span className="col-span-2">Spécialités : {pro.specialties.join(", ") || "—"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Protection & couvertures */}
        {pro && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider mb-4">
              Ma protection
            </h2>
            <ProtectionDashboard pro={pro} />
          </div>
        )}

        {/* Demandes client */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-axe-muted uppercase tracking-wider">
              Mes demandes
            </h2>
            <Link href="/demande" className="text-xs text-axe-accent hover:underline">
              + Nouvelle demande
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-8 text-center">
              <p className="text-axe-muted text-sm mb-4">Vous n&apos;avez pas encore de demande.</p>
              <Link href="/demande" className="btn-primary inline-block">
                Déposer une demande
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <RequestCard key={r.id} request={r} minimal />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
