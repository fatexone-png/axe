"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { isAdmin } from "@/lib/auth";
import AdminRequests from "@/components/AdminRequests";
import AdminProfessionals from "@/components/AdminProfessionals";
import { seedProfessionals } from "@/lib/seedProfessionals";
import { getProfessionals } from "@/lib/firestore";

type Tab = "requests" | "professionals";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("requests");
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u || !isAdmin(u)) {
        router.push("/");
        return;
      }
      setUser(u);
      setLoading(false);
      getProfessionals().then((list) =>
        setPendingCount(list.filter((p) => p.status === "pending").length)
      );
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted">Vérification accès…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-axe-white">Administration AXE</h1>
            <p className="text-axe-muted text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={seeding}
              onClick={async () => {
                if (!confirm("Ajouter 10 profils de démo dans Firestore ?")) return;
                setSeeding(true);
                setSeedMsg("");
                try {
                  const n = await seedProfessionals();
                  setSeedMsg(`${n} profils ajoutés.`);
                } catch (e) {
                  setSeedMsg(`Erreur : ${e instanceof Error ? e.message : String(e)}`);
                } finally {
                  setSeeding(false);
                }
              }}
              className="text-xs border border-white/10 text-axe-muted px-3 py-1.5 rounded-lg hover:border-axe-accent/30 hover:text-axe-accent transition-colors disabled:opacity-40"
            >
              {seeding ? "Seed en cours…" : "Seeder l'annuaire"}
            </button>
            {seedMsg && <span className="text-xs text-axe-accent">{seedMsg}</span>}
            <span className="text-xs bg-axe-accent/10 text-axe-accent border border-axe-accent/20 px-3 py-1 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-axe-charcoal border border-white/5 rounded-xl p-1 w-fit mb-8">
          <TabButton active={tab === "requests"} onClick={() => setTab("requests")}>
            Demandes clients
          </TabButton>
          <TabButton active={tab === "professionals"} onClick={() => setTab("professionals")}>
            Professionnels
            {pendingCount > 0 && (
              <span className="ml-2 bg-axe-amber text-axe-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </TabButton>
        </div>

        {tab === "requests" && <AdminRequests />}
        {tab === "professionals" && <AdminProfessionals />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-axe-accent text-axe-black" : "text-axe-muted hover:text-axe-white"
      }`}
    >
      {children}
    </button>
  );
}
