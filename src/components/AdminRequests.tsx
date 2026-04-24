"use client";

import { useEffect, useState } from "react";
import {
  getRequests,
  getProfessionals,
  updateRequestStatus,
  assignProfessional,
} from "@/lib/firestore";
import { ClientRequest, Professional, RequestStatus } from "@/lib/types";
import { PROFESSION_LABELS, STATUS_LABELS } from "@/lib/constants";
import RequestCard from "./RequestCard";
import InvoiceGenerator from "./InvoiceGenerator";

export default function AdminRequests() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [pros, setPros] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCity, setFilterCity] = useState("");
  const [filterGoal, setFilterGoal] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [assignTarget, setAssignTarget] = useState<string | null>(null);
  const [invoiceTarget, setInvoiceTarget] = useState<{ request: ClientRequest; pro: Professional } | null>(null);

  useEffect(() => {
    Promise.all([getRequests(), getProfessionals()]).then(([reqs, professionals]) => {
      setRequests(reqs);
      setPros(professionals.filter((p) => p.status === "approved"));
      setLoading(false);
    });
  }, []);

  const handleStatus = async (id: string, status: RequestStatus) => {
    await updateRequestStatus(id, status);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleAssign = async (requestId: string, proId: string) => {
    await assignProfessional(requestId, proId);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, assignedProfessionalId: proId, status: "matched" } : r
      )
    );
    setAssignTarget(null);
  };

  const filtered = requests.filter((r) => {
    if (filterCity && !r.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    if (filterGoal && r.goal !== filterGoal) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterUrgency && r.urgency !== filterUrgency) return false;
    return true;
  });

  if (loading) return <p className="text-axe-muted text-sm">Chargement des demandes…</p>;

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Ville…"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="input-admin"
        />
        <select value={filterGoal} onChange={(e) => setFilterGoal(e.target.value)} className="input-admin">
          <option value="">Tous les objectifs</option>
          <option value="pain">Douleur</option>
          <option value="sport_return">Reprise sportive</option>
          <option value="weight_loss">Perte de poids</option>
          <option value="performance">Performance</option>
          <option value="re_athletization">Réathlétisation</option>
          <option value="mobility">Mobilité</option>
          <option value="combat_prep">Préparation combat</option>
          <option value="fitness">Remise en forme</option>
          <option value="other">Autre</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-admin">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)} className="input-admin">
          <option value="">Toutes urgences</option>
          <option value="info">Simple renseignement</option>
          <option value="this_week">Cette semaine</option>
          <option value="quick">Rapidement</option>
        </select>
      </div>

      <p className="text-xs text-axe-muted">{filtered.length} demande{filtered.length > 1 ? "s" : ""}</p>

      {filtered.length === 0 && (
        <p className="text-axe-muted text-sm">Aucune demande correspondante.</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="space-y-3">
            <RequestCard request={r} />

            {/* Actions statut */}
            <div className="flex flex-wrap gap-2">
              {(["new", "contacted", "matched", "closed"] as RequestStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(r.id!, s)}
                  disabled={r.status === s}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    r.status === s
                      ? "bg-axe-charcoal border-white/10 text-axe-muted cursor-default"
                      : "border-axe-accent/30 text-axe-accent hover:bg-axe-accent/10"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <button
                onClick={() => setAssignTarget(assignTarget === r.id ? null : r.id!)}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-axe-muted hover:border-axe-accent/30 hover:text-axe-accent transition-colors"
              >
                {assignTarget === r.id ? "Annuler" : "Assigner un pro"}
              </button>
              {r.status === "matched" && r.assignedProfessionalId && (() => {
                const pro = pros.find((p) => p.id === r.assignedProfessionalId);
                return pro ? (
                  <button
                    onClick={() => setInvoiceTarget({ request: r, pro })}
                    className="text-xs px-3 py-1.5 rounded-lg border border-axe-accent/30 text-axe-accent hover:bg-axe-accent/10 transition-colors font-medium"
                  >
                    Générer une facture
                  </button>
                ) : null;
              })()}
            </div>

            {/* Sélecteur assignation */}
            {assignTarget === r.id && (
              <div className="bg-axe-dark border border-white/5 rounded-xl p-4">
                <p className="text-xs text-axe-muted mb-3 font-medium">Choisir un professionnel approuvé :</p>
                {pros.length === 0 && (
                  <p className="text-xs text-axe-muted">Aucun professionnel approuvé.</p>
                )}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pros.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAssign(r.id!, p.id!)}
                      className="w-full text-left p-2 rounded-lg bg-axe-charcoal hover:bg-axe-grey transition-colors"
                    >
                      <span className="text-sm text-axe-white">{p.firstName} {p.lastName}</span>
                      <span className="block text-xs text-axe-muted">
                        {PROFESSION_LABELS[p.profession]} · {p.city}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {invoiceTarget && (
        <InvoiceGenerator
          request={invoiceTarget.request}
          pro={invoiceTarget.pro}
          onClose={() => setInvoiceTarget(null)}
        />
      )}
    </div>
  );
}
