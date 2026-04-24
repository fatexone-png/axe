"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";
import { createReview, getReviewsByPro } from "@/lib/firestore";
import StarRating from "./StarRating";

interface Props {
  proId: string;
  proName: string;
}

function formatRelativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
}

function formatAuthorName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function toDate(value: Review["createdAt"]): Date {
  if (value instanceof Date) return value;
  // Firestore Timestamp has a toDate() method
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date();
}

const INPUT_CLASS =
  "w-full bg-axe-dark border border-white/10 rounded-xl px-4 py-3 text-axe-white placeholder:text-axe-muted focus:outline-none focus:border-axe-accent/50 transition-colors";

export default function ReviewsSection({ proId, proName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    getReviewsByPro(proId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [proId]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await createReview({ proId, authorName, authorEmail, rating, comment });
      setSubmitted(true);
      setAuthorName("");
      setAuthorEmail("");
      setRating(0);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-axe-white">Avis clients</h2>
          {averageRating !== null && (
            <p className="text-axe-muted text-sm mt-0.5">
              <span className="text-axe-white font-semibold text-base">
                {averageRating.toFixed(1)}
              </span>{" "}
              ⭐ ({reviews.length} avis)
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setSubmitted(false);
          }}
          className="text-sm font-medium text-axe-accent border border-axe-accent/30 rounded-xl px-4 py-2 hover:bg-axe-accent/10 transition-colors"
        >
          {showForm ? "Fermer" : "Laisser un avis"}
        </button>
      </div>

      {/* Formulaire collapsible */}
      {showForm && (
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-4">
          {submitted ? (
            <p className="text-axe-accent font-medium">
              ✓ Votre avis a été soumis et sera publié après modération.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm text-axe-muted">Votre nom</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Marie Dupont"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm text-axe-muted">Votre email</label>
                  <input
                    type="email"
                    required
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="marie@exemple.fr"
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-axe-muted">Note</label>
                <StarRating value={rating} onChange={setRating} size="lg" />
                {rating === 0 && (
                  <p className="text-xs text-axe-muted">
                    Cliquez sur une étoile pour noter
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-axe-muted">Commentaire</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Votre expérience avec ${proName}…`}
                  className={INPUT_CLASS + " resize-none"}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="w-full bg-axe-accent text-axe-black font-semibold rounded-xl py-3 hover:bg-axe-accentDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Envoi en cours…" : "Publier mon avis"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Liste des avis */}
      {loading ? (
        <p className="text-axe-muted text-sm">Chargement des avis…</p>
      ) : reviews.length === 0 ? (
        <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 text-center text-axe-muted">
          Aucun avis pour le moment. Soyez le premier !
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <StarRating value={review.rating} readonly size="sm" />
                  <span className="text-axe-white font-medium text-sm">
                    {formatAuthorName(review.authorName)}
                  </span>
                </div>
                <span className="text-axe-muted text-xs">
                  {formatRelativeDate(toDate(review.createdAt))}
                </span>
              </div>
              {review.comment && (
                <p className="text-axe-light text-sm leading-relaxed">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
