"use client";

import { useEffect, useState } from "react";
import { getProfessionals, updateProfessionalStatus } from "@/lib/firestore";
import { Professional, ProfessionalStatus } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import ProCard from "./ProCard";
import CoveragePanel from "./CoveragePanel";

export default function AdminProfessionals() {
  const [pros, setPros] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProfession, setFilterProfession] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  useEffect(() => {
    getProfessionals().then((data) => {
      setPros(data);
      setLoading(false);
    });
  }, []);

  const handleStatus = async (id: string, status: ProfessionalStatus) => {
    await updateProfessionalStatus(id, status);
    setPros((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleCoverageUpdate = (id: string, fields: Partial<Professional>) => {
    setPros((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
  };

  const filtered = pros.filter((p) => {
    if (filterProfession && p.profession !== filterProfession) return false;
    if (filterCity && !p.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  const pendingCount = pros.filter((p) => p.status === "pending").length;

  if (loading) return <p className="text-axe-muted text-sm">Chargement des professionnels…</p>;

  return (
    <div className="space-y-6">
      {/* Bandeau inscriptions en attente */}
      {pendingCount > 0 && (
        <div
          className="flex items-center justify-between bg-axe-amber/10 border border-axe-amber/30 rounded-xl px-5 py-3 cursor-pointer"
          onClick={() => setFilterStatus("pending")}
        >
          <div className="flex items-center gap-3">
            <span className="text-axe-amber font-bold text-lg">⚠</span>
            <div>
              <p className="text-sm font-semibold text-axe-amber">
                {pendingCount} candidature{pendingCount > 1 ? "s" : ""} en attente de validation
              </p>
              <p className="text-xs text-axe-amber/70">Cliquez pour filtrer</p>
            </div>
          </div>
          <span className="bg-axe-amber text-axe-black text-xs font-bold px-2.5 py-1 rounded-full">
            {pendingCount}
          </span>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterProfession}
          onChange={(e) => setFilterProfession(e.target.value)}
          className="input-admin"
        >
          <option value="">Toutes les professions</option>
          {Object.entries(PROFESSION_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Ville…"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="input-admin"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-admin"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvé</option>
          <option value="rejected">Refusé</option>
        </select>
      </div>

      <p className="text-xs text-axe-muted">{filtered.length} professionnel{filtered.length > 1 ? "s" : ""}</p>

      {filtered.length === 0 && (
        <p className="text-axe-muted text-sm">Aucun professionnel correspondant.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="space-y-3">
            <ProCard pro={p} />

            {/* Document justificatif — lien interne protégé, pas exposé publiquement */}
            {p.documentUrl && (
              <p className="text-xs text-axe-muted">
                Document :{" "}
                <a
                  href={p.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-axe-accent hover:underline"
                >
                  Voir le fichier
                </a>
              </p>
            )}

            <CoveragePanel pro={p} onUpdate={handleCoverageUpdate} />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatus(p.id!, "approved")}
                disabled={p.status === "approved"}
                className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
                  p.status === "approved"
                    ? "bg-green-900/20 text-green-600 cursor-default"
                    : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                }`}
              >
                Approuver
              </button>
              <button
                onClick={() => handleStatus(p.id!, "rejected")}
                disabled={p.status === "rejected"}
                className={`text-xs px-4 py-2 rounded-lg font-semibold transition-colors ${
                  p.status === "rejected"
                    ? "bg-red-900/20 text-red-600 cursor-default"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                }`}
              >
                Refuser
              </button>
              <button
                onClick={() => handleStatus(p.id!, "pending")}
                disabled={p.status === "pending"}
                className="text-xs px-3 py-2 rounded-lg text-axe-muted hover:text-axe-white border border-white/5 hover:border-white/20 transition-colors"
              >
                Remettre en attente
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
