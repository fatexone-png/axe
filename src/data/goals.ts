export const GOALS = [
  { value: "pain", label: "Douleur" },
  { value: "sport_return", label: "Reprise sportive" },
  { value: "weight_loss", label: "Perte de poids" },
  { value: "performance", label: "Performance" },
  { value: "re_athletization", label: "Réathlétisation" },
  { value: "mobility", label: "Mobilité" },
  { value: "combat_prep", label: "Préparation combat" },
  { value: "fitness", label: "Remise en forme" },
  { value: "other", label: "Autre" },
] as const;

export const BODY_AREAS = [
  { value: "back", label: "Dos" },
  { value: "knee", label: "Genou" },
  { value: "shoulder", label: "Épaule" },
  { value: "hip", label: "Hanche" },
  { value: "ankle", label: "Cheville" },
  { value: "global", label: "Global" },
  { value: "other", label: "Autre" },
] as const;

export const URGENCY_LEVELS = [
  { value: "info", label: "Simple renseignement" },
  { value: "this_week", label: "Cette semaine" },
  { value: "quick", label: "Rapidement" },
] as const;

export const RADIUS_OPTIONS = [
  { value: "5km", label: "5 km" },
  { value: "10km", label: "10 km" },
  { value: "20km", label: "20 km" },
  { value: "remote", label: "À distance" },
] as const;

export const BUDGET_OPTIONS = [
  { value: "under_50", label: "Moins de 50 €" },
  { value: "50_80", label: "50 – 80 €" },
  { value: "80_120", label: "80 – 120 €" },
  { value: "over_120", label: "Plus de 120 €" },
] as const;
