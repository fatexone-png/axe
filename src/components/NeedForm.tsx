"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createRequest } from "@/lib/firestore";
import { GOALS, BODY_AREAS, URGENCY_LEVELS, RADIUS_OPTIONS, BUDGET_OPTIONS } from "@/data/goals";
import { PREFERRED_PROFESSIONS } from "@/data/professions";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  address?: string;
  homeVisit: boolean;
  radius: string;
  goal: string;
  bodyArea: string;
  urgency: string;
  preferredProfession: string;
  budget: string;
  message: string;
  consent: boolean;
};

export default function NeedForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const { consent: _, ...rest } = data;
      await createRequest({ ...rest, homeVisit: data.homeVisit === true });
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("NeedForm error:", err);
      setError(`Erreur : ${msg}`);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-axe-accent/10 border border-axe-accent/20 mb-4">
          <span className="text-axe-accent text-2xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-axe-white">Demande envoyée</h2>
        <p className="text-axe-muted max-w-sm mx-auto">
          Nous avons bien reçu votre demande. L&apos;équipe AXE vous contacte dans les plus brefs délais pour vous proposer le bon professionnel.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
      {/* Identité */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prénom *" error={errors.firstName?.message}>
          <input {...register("firstName", { required: "Requis" })} className="input" placeholder="Jean" />
        </Field>
        <Field label="Nom *" error={errors.lastName?.message}>
          <input {...register("lastName", { required: "Requis" })} className="input" placeholder="Dupont" />
        </Field>
      </div>

      <Field label="Email *" error={errors.email?.message}>
        <input {...register("email", { required: "Requis", pattern: { value: /^\S+@\S+$/, message: "Email invalide" } })} className="input" type="email" placeholder="jean@exemple.fr" />
      </Field>

      <Field label="Téléphone *" error={errors.phone?.message}>
        <input {...register("phone", { required: "Requis" })} className="input" type="tel" placeholder="06 00 00 00 00" />
      </Field>

      {/* Localisation */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Ville *" error={errors.city?.message}>
          <input {...register("city", { required: "Requis" })} className="input" placeholder="Paris" />
        </Field>
        <Field label="Code postal *" error={errors.postalCode?.message}>
          <input {...register("postalCode", { required: "Requis" })} className="input" placeholder="75011" />
        </Field>
      </div>

      <Field label="Adresse (optionnel)">
        <input {...register("address")} className="input" placeholder="12 rue de la Paix" />
      </Field>

      <Field label="Déplacement à domicile ?">
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
            <input type="radio" value="true" {...register("homeVisit")} className="accent-axe-accent" />
            Oui
          </label>
          <label className="flex items-center gap-2 text-axe-muted text-sm cursor-pointer">
            <input type="radio" value="false" {...register("homeVisit")} defaultChecked className="accent-axe-accent" />
            Non
          </label>
        </div>
      </Field>

      <Field label="Rayon de recherche *" error={errors.radius?.message}>
        <select {...register("radius", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {RADIUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      {/* Besoins */}
      <Field label="Objectif principal *" error={errors.goal?.message}>
        <select {...register("goal", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {GOALS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Zone concernée *" error={errors.bodyArea?.message}>
        <select {...register("bodyArea", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {BODY_AREAS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Niveau d'urgence *" error={errors.urgency?.message}>
        <select {...register("urgency", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {URGENCY_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Professionnel souhaité *" error={errors.preferredProfession?.message}>
        <select {...register("preferredProfession", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {PREFERRED_PROFESSIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Budget indicatif *" error={errors.budget?.message}>
        <select {...register("budget", { required: "Requis" })} className="input">
          <option value="">Choisir…</option>
          {BUDGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Message (optionnel)">
        <textarea {...register("message")} className="input min-h-[100px] resize-none" placeholder="Décrivez votre situation en quelques mots…" />
      </Field>

      {/* Consentement */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          {...register("consent", { required: "Vous devez accepter pour continuer." })}
          className="mt-1 accent-axe-accent"
        />
        <span className="text-xs text-axe-muted leading-relaxed">
          Je comprends qu&apos;AXE facilite une mise en relation et ne remplace pas un avis médical d&apos;urgence.
          En cas d&apos;urgence, j&apos;appelle le 15 ou le 112.
        </span>
      </label>
      {errors.consent && <p className="text-red-400 text-xs">{errors.consent.message}</p>}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-axe-accent text-axe-black font-bold py-4 rounded-xl hover:bg-axe-accentDark transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
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
