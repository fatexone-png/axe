"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { getProfessionalByEmail } from "@/lib/firestore";
import { Professional } from "@/lib/types";
import { PROFESSION_LABELS } from "@/lib/constants";
import Link from "next/link";

type AvailabilityStatus =
  | "available"
  | "unavailable"
  | "full";

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: "available", label: "Disponible maintenant" },
  { value: "unavailable", label: "Indisponible temporairement" },
  { value: "full", label: "Complet" },
];

interface EditableFields {
  bio: string;
  specialtiesRaw: string;
  phone: string;
  availability: AvailabilityStatus;
}

const INPUT_CLASS =
  "w-full bg-axe-dark border border-white/10 rounded-xl px-4 py-3 text-axe-white placeholder-axe-muted focus:border-axe-accent/50 focus:outline-none";

const READONLY_CLASS =
  "w-full bg-axe-dark/50 border border-white/10 rounded-xl px-4 py-3 text-axe-muted opacity-60 cursor-not-allowed";

export default function DashboardProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pro, setPro] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [fields, setFields] = useState<EditableFields>({
    bio: "",
    specialtiesRaw: "",
    phone: "",
    availability: "available",
  });

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);

      const proProfile = await getProfessionalByEmail(u.email!);
      if (proProfile) {
        setPro(proProfile);
        setFields({
          bio: proProfile.bio ?? "",
          specialtiesRaw: proProfile.specialties.join(", "),
          phone: proProfile.phone ?? "",
          availability: "available",
        });
      }
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    if (!pro?.id) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      const specialties = fields.specialtiesRaw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await updateDoc(doc(db, "professionals", pro.id), {
        bio: fields.bio,
        specialties,
        phone: fields.phone,
        availability: fields.availability,
      });

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setErrorMsg(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-axe-black flex items-center justify-center">
        <p className="text-axe-muted text-sm">Chargement…</p>
      </div>
    );
  }

  if (!user) return null;

  if (!pro) {
    return (
      <div className="min-h-screen bg-axe-black flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-axe-white text-lg font-semibold">
          Aucun profil professionnel trouvé
        </p>
        <p className="text-axe-muted text-sm text-center max-w-sm">
          Votre compte n&apos;est pas associé à un profil professionnel sur AXE.
        </p>
        <Link href="/dashboard" className="text-axe-accent hover:underline text-sm">
          ← Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const specialtyTags = fields.specialtiesRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="min-h-screen bg-axe-black pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-axe-white">Mon profil</h1>
            <p className="text-axe-muted text-sm mt-1">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="text-axe-muted hover:text-axe-white text-sm transition-colors"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Champs non-modifiables */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider mb-2">
            Informations fixes
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-axe-muted mb-1">Nom complet</label>
              <div className={READONLY_CLASS}>
                {pro.firstName} {pro.lastName}
              </div>
            </div>

            <div>
              <label className="block text-xs text-axe-muted mb-1">Profession</label>
              <div className={READONLY_CLASS}>
                {PROFESSION_LABELS[pro.profession] ?? pro.profession}
              </div>
            </div>

            <div>
              <label className="block text-xs text-axe-muted mb-1">Ville</label>
              <div className={READONLY_CLASS}>{pro.city}</div>
            </div>

            {pro.siret && (
              <div>
                <label className="block text-xs text-axe-muted mb-1">SIRET</label>
                <div className={READONLY_CLASS}>{pro.siret}</div>
              </div>
            )}
          </div>

          <p className="text-xs text-axe-muted pt-2">
            Ces informations ne peuvent pas être modifiées directement.{" "}
            <Link href="mailto:contact@axe.fr" className="text-axe-accent hover:underline">
              Contactez-nous
            </Link>{" "}
            pour toute correction.
          </p>
        </div>

        {/* Champs modifiables */}
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-xs font-semibold text-axe-muted uppercase tracking-wider">
            Informations éditables
          </h2>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-axe-white mb-2">
              Bio / Présentation
            </label>
            <textarea
              rows={8}
              value={fields.bio}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Décrivez votre parcours, votre approche, vos spécialités…"
              className={INPUT_CLASS + " resize-none"}
            />
          </div>

          {/* Spécialités */}
          <div>
            <label className="block text-sm font-medium text-axe-white mb-2">
              Spécialités{" "}
              <span className="text-axe-muted text-xs font-normal">
                (séparées par des virgules)
              </span>
            </label>
            <textarea
              rows={2}
              value={fields.specialtiesRaw}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, specialtiesRaw: e.target.value }))
              }
              placeholder="Rééducation, Prépa physique, Nutrition sportive…"
              className={INPUT_CLASS + " resize-none"}
            />
            {specialtyTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {specialtyTags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-axe-accent/10 text-axe-accent rounded-full px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-axe-white mb-2">
              Téléphone
            </label>
            <input
              type="text"
              value={fields.phone}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="06 00 00 00 00"
              className={INPUT_CLASS}
            />
          </div>

          {/* Disponibilité */}
          <div>
            <label className="block text-sm font-medium text-axe-white mb-2">
              Disponibilité
            </label>
            <select
              value={fields.availability}
              onChange={(e) =>
                setFields((prev) => ({
                  ...prev,
                  availability: e.target.value as AvailabilityStatus,
                }))
              }
              className={INPUT_CLASS}
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback messages */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <p className="text-green-400 text-sm font-medium">
              Profil mis à jour ✓
            </p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {/* Bouton de sauvegarde */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-axe-accent text-axe-black font-bold text-base rounded-2xl px-8 py-4 hover:bg-axe-accentDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Sauvegarde…" : "Enregistrer les modifications"}
        </button>

      </div>
    </div>
  );
}
