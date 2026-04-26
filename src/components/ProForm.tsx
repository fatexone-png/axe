"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { createProfessional } from "@/lib/firestore";
import { PROFESSIONS } from "@/data/professions";
import { SPECIALTIES } from "@/data/specialties";
import { RADIUS_OPTIONS } from "@/data/goals";
import { Profession, InterventionLocation, LEGAL_STATUS_LABELS } from "@/lib/types";

const BIO_TEMPLATES: Record<string, string> = {
  coach:
    "Coach sportif avec [X] ans d'expérience, je travaille avec des personnes qui veulent reprendre une activité physique, perdre du poids ou améliorer leurs performances. Mon approche est progressive et personnalisée : je m'adapte à votre niveau, vos contraintes et vos objectifs. J'interviens en salle, en extérieur ou à domicile selon vos préférences.",
  physical_trainer:
    "Préparateur physique avec [X] ans d'expérience, j'accompagne des sportifs amateurs et compétiteurs dans l'optimisation de leurs capacités physiques. Je conçois des programmes structurés centrés sur la force, l'endurance et la prévention des blessures. Mon suivi est rigoureux, basé sur des données et adapté à chaque profil.",
  kine:
    "Kinésithérapeute diplômé(e) avec [X] ans de pratique, je prends en charge les douleurs musculo-squelettiques, les suites de blessures et les rééducations post-opératoires. Mon approche associe techniques manuelles et exercices thérapeutiques pour un retour à la fonction optimale.",
  osteo:
    "Ostéopathe avec [X] ans d'expérience, j'accompagne mes patients dans la résolution de douleurs chroniques, de tensions et de blocages fonctionnels. Je travaille de manière globale sur le corps pour restaurer l'équilibre et favoriser la récupération naturelle.",
  sports_doctor:
    "Médecin du sport avec [X] ans d'expérience, j'assure le suivi médical des sportifs de tous niveaux : certificats d'aptitude, bilans de performance, gestion des blessures et conseils en nutrition sportive. Je travaille en lien étroit avec les autres professionnels du corps pour une prise en charge complète.",
  recovery:
    "Spécialiste de la récupération et de la mobilité avec [X] ans d'expérience, j'accompagne sportifs et actifs dans l'optimisation de leur récupération : étirements, travail fascial, mobilité articulaire. Mon objectif est de vous aider à mieux récupérer pour performer durablement.",
  default:
    "Professionnel du corps avec [X] ans d'expérience, j'accompagne mes clients vers leurs objectifs de santé, de performance et de bien-être. Mon approche est personnalisée, bienveillante et axée sur des résultats concrets. Je m'adapte à chaque profil et travaille en toute transparence sur les possibilités et les limites de mon intervention.",
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  homeVisit: boolean;
  radius: string;
  profession: Profession;
  specialties: string[];
  experienceYears: number;
  diploma: string;
  rppsOrAdeli?: string;
  hasInsurance: boolean;
  insuranceCompany?: string;
  bio: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  siret?: string;
  legalStatus?: string;
  vatNumber?: string;
  vatExempt?: boolean;
};

const emptyLocation = (): InterventionLocation => ({ city: "", postalCode: "" });

export default function ProForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [locations, setLocations] = useState<InterventionLocation[]>([emptyLocation()]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>();
  const selectedProfession = watch("profession");
  const hasInsurance = watch("hasInsurance");

  const applyTemplate = () => {
    const template = BIO_TEMPLATES[selectedProfession] ?? BIO_TEMPLATES.default;
    setValue("bio", template, { shouldValidate: true });
  };

  const addLocation = () => setLocations((prev) => [...prev, emptyLocation()]);

  const removeLocation = (index: number) =>
    setLocations((prev) => prev.filter((_, i) => i !== index));

  const updateLocation = (index: number, field: keyof InterventionLocation, value: string) =>
    setLocations((prev) =>
      prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc))
    );

  const onSubmit = async (data: FormData) => {
    const validLocations = locations.filter((l) => l.city.trim());
    if (validLocations.length === 0) {
      setError("Ajoutez au moins une ville d'intervention.");
      return;
    }

    try {
      let documentUrl: string | undefined;

      if (fileRef.current?.files?.[0]) {
        setUploading(true);
        const file = fileRef.current.files[0];
        const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        documentUrl = await getDownloadURL(storageRef);
        setUploading(false);
      }

      const payload: Record<string, unknown> = {
        ...data,
        homeVisit: data.homeVisit === true,
        hasInsurance: data.hasInsurance === true,
        experienceYears: Number(data.experienceYears),
        specialties: Array.isArray(data.specialties)
          ? data.specialties
          : [data.specialties].filter(Boolean),
        locations: validLocations,
      };

      // Firestore refuse les champs undefined
      if (documentUrl) payload.documentUrl = documentUrl;
      const optionals = ["rppsOrAdeli", "insuranceCompany", "website", "instagram", "linkedin"];
      optionals.forEach((key) => { if (!payload[key]) delete payload[key]; });

      await createProfessional(payload as never);
      setSubmitted(true);
    } catch (err) {
      setUploading(false);
      const msg = err instanceof Error ? err.message : String(err);
      console.error("ProForm error:", err);
      setError(`Erreur : ${msg}`);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-axe-accent/10 border border-axe-accent/20">
          <span className="text-axe-accent text-2xl">✓</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-axe-white">Candidature envoyée !</h2>
          <p className="text-axe-muted max-w-sm mx-auto text-sm">
            L&apos;équipe AXE examine votre dossier. Vous recevrez un email de confirmation dans les 48h ouvrées.
          </p>
        </div>

        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto">
          <p className="text-sm font-semibold text-axe-white">La suite du processus :</p>
          <ul className="space-y-2 text-sm text-axe-muted">
            <li className="flex gap-2">
              <span className="text-axe-accent font-bold flex-shrink-0">1.</span>
              Vérification de votre diplôme et de votre identité
            </li>
            <li className="flex gap-2">
              <span className="text-axe-accent font-bold flex-shrink-0">2.</span>
              Email de validation avec vos accès (statut <em>En attente</em> → <em>Approuvé</em>)
            </li>
            <li className="flex gap-2">
              <span className="text-axe-accent font-bold flex-shrink-0">3.</span>
              Vous configurez vos tarifs, disponibilités et paiements dans votre tableau de bord
            </li>
          </ul>
        </div>

        <p className="text-xs text-axe-muted">
          Déjà validé ?{" "}
          <a href="/login" className="text-axe-accent underline underline-offset-2">
            Connectez-vous
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
      {/* Identité */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom *" error={errors.firstName?.message}>
          <input {...register("firstName", { required: "Requis" })} className="input" placeholder="Marie" />
        </Field>
        <Field label="Nom *" error={errors.lastName?.message}>
          <input {...register("lastName", { required: "Requis" })} className="input" placeholder="Martin" />
        </Field>
      </div>

      <Field label="Email professionnel *" error={errors.email?.message}>
        <input
          {...register("email", { required: "Requis", pattern: { value: /^\S+@\S+$/, message: "Email invalide" } })}
          className="input"
          type="email"
        />
      </Field>

      <Field label="Téléphone *" error={errors.phone?.message}>
        <input {...register("phone", { required: "Requis" })} className="input" type="tel" />
      </Field>

      {/* Localisation principale */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-axe-muted">Adresse principale</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ville *" error={errors.city?.message}>
            <input {...register("city", { required: "Requis" })} className="input" placeholder="Paris" />
          </Field>
          <Field label="Code postal *" error={errors.postalCode?.message}>
            <input {...register("postalCode", { required: "Requis" })} className="input" placeholder="75011" />
          </Field>
        </div>
      </div>

      {/* Lieux d'intervention dynamiques */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-axe-muted">
            Villes d&apos;intervention *
            <span className="block text-xs font-normal mt-0.5">Toutes les villes où vous travaillez</span>
          </p>
          <button
            type="button"
            onClick={addLocation}
            className="text-xs text-axe-accent border border-axe-accent/30 px-3 py-1.5 rounded-lg hover:bg-axe-accent/10 transition-colors"
          >
            + Ajouter une ville
          </button>
        </div>

        <div className="space-y-3">
          {locations.map((loc, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={loc.city}
                  onChange={(e) => updateLocation(index, "city", e.target.value)}
                  className="input"
                  placeholder={`Ville ${index + 1}`}
                />
                <input
                  type="text"
                  value={loc.postalCode}
                  onChange={(e) => updateLocation(index, "postalCode", e.target.value)}
                  className="input"
                  placeholder="Code postal"
                />
              </div>
              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLocation(index)}
                  className="mt-3 text-axe-muted hover:text-red-400 transition-colors text-lg leading-none"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Field label="Déplacement à domicile ?">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
            <input type="radio" value="true" {...register("homeVisit")} className="accent-axe-accent" /> Oui
          </label>
          <label className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
            <input type="radio" value="false" {...register("homeVisit")} defaultChecked className="accent-axe-accent" /> Non
          </label>
        </div>
      </Field>

      <Field label="Rayon de déplacement" error={errors.radius?.message}>
        <select {...register("radius", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {RADIUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      {/* Profession */}
      <Field label="Profession *" error={errors.profession?.message}>
        <select {...register("profession", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {PROFESSIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </Field>

      <Field label="Spécialités (plusieurs choix possibles)">
        <div className="grid grid-cols-2 gap-2 mt-1">
          {SPECIALTIES.map((s) => (
            <label key={s.value} className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
              <input type="checkbox" value={s.value} {...register("specialties")} className="accent-axe-accent" />
              {s.label}
            </label>
          ))}
        </div>
      </Field>

      {/* Expérience */}
      <Field label="Années d'expérience *" error={errors.experienceYears?.message}>
        <input
          {...register("experienceYears", { required: "Requis", min: { value: 0, message: "Min 0" } })}
          className="input"
          type="number"
          min={0}
        />
      </Field>

      <Field label="Diplôme / Certification *" error={errors.diploma?.message}>
        <input {...register("diploma", { required: "Requis" })} className="input" placeholder="BPJEPS, DU, Master STAPS…" />
      </Field>

      <Field label="Numéro RPPS ou ADELI (si applicable)">
        <input {...register("rppsOrAdeli")} className="input" placeholder="Optionnel pour professionnels de santé" />
      </Field>

      {/* Assurance */}
      <Field label="Assurance RC Pro ?">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
            <input type="radio" value="true" {...register("hasInsurance")} className="accent-axe-accent" /> Oui
          </label>
          <label className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
            <input type="radio" value="false" {...register("hasInsurance")} defaultChecked className="accent-axe-accent" /> Non
          </label>
        </div>
      </Field>

      {String(hasInsurance) === "false" && (
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-3">
          <p className="text-yellow-400 text-sm font-semibold">
            Pas encore assuré en RC Pro ? Pas de problème.
          </p>
          <p className="text-xs text-yellow-400/80 leading-relaxed">
            AXE vous met en relation avec nos partenaires assureurs spécialisés dans les métiers du sport et de la santé.
            Votre profil sera validé sous réserve de régularisation — vous avez 30 jours après approbation pour vous couvrir.
          </p>
          <div className="grid grid-cols-1 gap-2 pt-1">
            {[
              { name: "Hiscox", desc: "Spécialiste professions libérales & sport", price: "dès 15 €/mois", url: "https://www.hiscox.fr" },
              { name: "Simplis", desc: "RC Pro en ligne pour auto-entrepreneurs", price: "dès 10 €/mois", url: "https://www.simplis.fr" },
              { name: "AXA Pro", desc: "Couverture complète + prévoyance", price: "dès 25 €/mois", url: "https://www.axa.fr" },
            ].map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-axe-charcoal border border-white/5 hover:border-yellow-500/30 rounded-lg px-3 py-2.5 transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-axe-white">{p.name}</p>
                  <p className="text-xs text-axe-muted">{p.desc}</p>
                </div>
                <span className="text-xs text-yellow-400 font-medium flex-shrink-0 ml-3">{p.price}</span>
              </a>
            ))}
          </div>
          <p className="text-xs text-axe-muted/60">
            Une fois assuré, transmettez votre attestation à <strong className="text-axe-muted">contact@axe.fr</strong> pour validation définitive de votre profil.
          </p>
        </div>
      )}

      <Field label="Compagnie d'assurance (optionnel)">
        <input {...register("insuranceCompany")} className="input" placeholder="AXA, Maif…" />
      </Field>

      {/* Document */}
      <Field label="Document justificatif (diplôme, certification — optionnel)">
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="text-axe-muted text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-axe-charcoal file:text-axe-white hover:file:bg-axe-grey cursor-pointer"
        />
      </Field>

      {/* Bio */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm text-axe-muted font-medium">Bio professionnelle *</label>
          <button
            type="button"
            onClick={applyTemplate}
            className="text-xs text-axe-accent border border-axe-accent/30 px-3 py-1.5 rounded-lg hover:bg-axe-accent/10 transition-colors"
          >
            Utiliser un modèle
          </button>
        </div>
        <textarea
          {...register("bio", { required: "Requis", minLength: { value: 50, message: "Minimum 50 caractères" } })}
          className="input min-h-[140px] resize-none"
          placeholder="Présentez votre parcours, votre approche, vos valeurs…"
        />
        {errors.bio && <p className="text-red-400 text-xs">{errors.bio.message}</p>}
        <p className="text-xs text-axe-muted">
          Cliquez sur &quot;Utiliser un modèle&quot; pour démarrer avec un texte adapté à votre profession, puis personnalisez-le.
        </p>
      </div>

      {/* Informations légales & facturation */}
      <div className="space-y-4 pt-2">
        <div className="border-t border-white/5 pt-4">
          <p className="text-sm font-medium text-axe-white mb-1">Informations légales</p>
          <p className="text-xs text-axe-muted mb-4">
            Nécessaires pour la facturation électronique obligatoire à partir de septembre 2026.
          </p>
        </div>

        <Field label="Statut juridique">
          <select {...register("legalStatus")} className="input">
            <option value="">Choisir…</option>
            {Object.entries(LEGAL_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>

        <Field label="SIRET">
          <input
            {...register("siret", {
              pattern: { value: /^\d{14}$/, message: "Le SIRET doit contenir 14 chiffres" }
            })}
            className="input"
            placeholder="12345678901234"
            maxLength={14}
          />
          <p className="text-xs text-axe-muted mt-1">14 chiffres — obligatoire pour facturer légalement</p>
        </Field>

        <Field label="Numéro de TVA intracommunautaire" error={undefined}>
          <input
            {...register("vatNumber")}
            className="input"
            placeholder="FR12345678901"
          />
        </Field>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("vatExempt")}
            className="mt-1 accent-axe-accent"
          />
          <span className="text-xs text-axe-muted leading-relaxed">
            Je suis en franchise en base de TVA (auto-entrepreneur sous le seuil de chiffre d&apos;affaires).
            <br />
            <span className="text-axe-muted/60">Mention légale : &quot;TVA non applicable, art. 293 B du CGI&quot;</span>
          </span>
        </label>
      </div>

      {/* Liens */}
      <div className="space-y-3">
        <p className="text-sm text-axe-muted font-medium">Liens (optionnels)</p>
        <input {...register("website")} className="input" placeholder="Site web : https://…" />
        <input {...register("instagram")} className="input" placeholder="Instagram : @votre_compte" />
        <input {...register("linkedin")} className="input" placeholder="LinkedIn : https://linkedin.com/in/…" />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-full bg-axe-accent text-axe-black font-bold py-4 rounded-xl hover:bg-axe-accentDark transition-colors disabled:opacity-50"
      >
        {uploading ? "Upload en cours…" : isSubmitting ? "Envoi en cours…" : "Soumettre mon profil"}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-axe-muted font-medium">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
