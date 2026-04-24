export const PROFESSIONS = [
  { value: "coach", label: "Coach sportif" },
  { value: "physical_trainer", label: "Préparateur physique" },
  { value: "kine", label: "Kinésithérapeute" },
  { value: "osteo", label: "Ostéopathe" },
  { value: "sports_doctor", label: "Médecin du sport" },
  { value: "recovery", label: "Récupération / Mobilité" },
] as const;

export const PREFERRED_PROFESSIONS = [
  ...PROFESSIONS,
  { value: "unknown", label: "Je ne sais pas" },
] as const;
