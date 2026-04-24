"use client";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS: Record<string, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: Props) {
  const sizeClass = SIZE_CLASS[size];
  const interactive = !readonly && typeof onChange === "function";

  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} étoiles sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange!(star)}
          className={[
            sizeClass,
            "leading-none transition-colors",
            star <= value ? "text-axe-accent" : "text-axe-grey",
            interactive
              ? "cursor-pointer hover:text-axe-accent"
              : "cursor-default",
            "disabled:cursor-default",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </span>
  );
}
