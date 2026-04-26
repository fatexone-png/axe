// Données des formations diplômantes françaises pour les métiers du sport et de la santé
// Sources : Ministère des Sports, Ministère de la Santé, CPU, Légifrance — mise à jour 2024

export type FormationProfession =
  | "coach"
  | "physical_trainer"
  | "kine"
  | "osteo"
  | "sports_doctor";

export type EducationLevel = "bac" | "bac2" | "bac3" | "bac5plus";

export type FrenchRegion = string; // 13 régions métropolitaines

export interface School {
  name: string;
  city: string;
  region: FrenchRegion;
  type: "public" | "private";
  url?: string; // absent = pas de lien
}

export interface Formation {
  id: string;
  profession: FormationProfession;
  diploma: string;
  diplomaType: "state" | "private_accredited" | "university" | "cqp";
  duration: string;
  minLevel: EducationLevel;
  cost: string;
  description: string;
  jobTitle: string;
  isRequired: boolean;
  alternance: boolean;
  schools: School[];
}

// ---------------------------------------------------------------------------
// Régions
// ---------------------------------------------------------------------------

export const REGIONS: FrenchRegion[] = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
];

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  bac: "Baccalauréat",
  bac2: "Bac+2 (BTS, DUT, DEUST)",
  bac3: "Bac+3 (Licence)",
  bac5plus: "Bac+5 et plus (Master, Doctorat)",
};

export const PROFESSION_ORIENTATION_LABELS: Record<FormationProfession, string> = {
  coach: "Coach sportif / Personal trainer",
  physical_trainer: "Préparateur physique",
  kine: "Kinésithérapeute",
  osteo: "Ostéopathe",
  sports_doctor: "Médecin du sport",
};

// ---------------------------------------------------------------------------
// Formations
// ---------------------------------------------------------------------------

export const FORMATIONS: Formation[] = [
  // -------------------------------------------------------------------------
  // COACH SPORTIF
  // -------------------------------------------------------------------------
  {
    id: "bpjeps-afcc",
    profession: "coach",
    diploma: "BPJEPS Activités de la Forme – Cours Collectifs (AF/CC)",
    diplomaType: "state",
    duration: "1 an",
    minLevel: "bac",
    cost: "3 000 – 8 000 € (alternance possible)",
    description:
      "Diplôme d'État permettant d'encadrer des cours collectifs (fitness, step, aquagym, HIIT). Obligatoire pour être rémunéré dans ce domaine. Accessible en alternance via un CREPS ou un centre agréé par l'État.",
    jobTitle: "Animateur / Éducateur sportif Cours Collectifs",
    isRequired: true,
    alternance: true,
    schools: [
      { name: "CREPS Hauts-de-France", city: "Wattignies", region: "Hauts-de-France", type: "public", url: "https://creps-npdc.fr" },
      { name: "CREPS de Strasbourg", city: "Strasbourg", region: "Grand Est", type: "public", url: "https://www.creps-strasbourg.sports.gouv.fr" },
      { name: "CREPS Auvergne-Rhône-Alpes", city: "Bellerive-sur-Allier", region: "Auvergne-Rhône-Alpes", type: "public", url: "https://www.creps-vichy.sports.gouv.fr" },
      { name: "CREPS de Bordeaux", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public", url: "https://www.creps-bordeaux.sports.gouv.fr" },
      { name: "CREPS de Montpellier", city: "Montpellier", region: "Occitanie", type: "public", url: "https://www.creps-montpellier.sports.gouv.fr" },
      { name: "CREPS de Bretagne", city: "Dinard", region: "Bretagne", type: "public", url: "https://www.creps-dinard.sports.gouv.fr" },
      { name: "CREPS d'Île-de-France", city: "Paris", region: "Île-de-France", type: "public", url: "https://creps-idf.fr" },
      { name: "CREPS de Toulouse", city: "Toulouse", region: "Occitanie", type: "public", url: "https://www.creps-toulouse.sports.gouv.fr" },
    ],
  },

  {
    id: "bpjeps-agff",
    profession: "coach",
    diploma: "BPJEPS Activités Gymniques de la Forme et de la Force (AGFF)",
    diplomaType: "state",
    duration: "1 an",
    minLevel: "bac",
    cost: "3 000 – 8 000 € (alternance possible)",
    description:
      "Permet d'encadrer la musculation, le cardio-training et le coaching personnalisé en salle de sport. Diplôme d'État obligatoire pour toute activité rémunérée en salle de fitness ou de musculation.",
    jobTitle: "Éducateur sportif Musculation / Cardio-training",
    isRequired: true,
    alternance: true,
    schools: [
      { name: "CREPS Hauts-de-France", city: "Wattignies", region: "Hauts-de-France", type: "public", url: "https://creps-npdc.fr" },
      { name: "CREPS de Strasbourg", city: "Strasbourg", region: "Grand Est", type: "public", url: "https://www.creps-strasbourg.sports.gouv.fr" },
      { name: "CREPS Auvergne-Rhône-Alpes", city: "Bellerive-sur-Allier", region: "Auvergne-Rhône-Alpes", type: "public", url: "https://www.creps-vichy.sports.gouv.fr" },
      { name: "CREPS de Bordeaux", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public", url: "https://www.creps-bordeaux.sports.gouv.fr" },
      { name: "CREPS de Montpellier", city: "Montpellier", region: "Occitanie", type: "public", url: "https://www.creps-montpellier.sports.gouv.fr" },
      { name: "CREPS de Bretagne", city: "Dinard", region: "Bretagne", type: "public", url: "https://www.creps-dinard.sports.gouv.fr" },
      { name: "CREPS d'Île-de-France", city: "Paris", region: "Île-de-France", type: "public", url: "https://creps-idf.fr" },
      { name: "CREPS de Toulouse", city: "Toulouse", region: "Occitanie", type: "public", url: "https://www.creps-toulouse.sports.gouv.fr" },
    ],
  },

  {
    id: "licence-staps-coach",
    profession: "coach",
    diploma: "Licence STAPS – Sciences et Techniques des Activités Physiques et Sportives",
    diplomaType: "university",
    duration: "3 ans",
    minLevel: "bac",
    cost: "Gratuit (frais d'inscription ~200 €/an)",
    description:
      "Licence universitaire ouvrant vers le coaching, la préparation physique ou l'enseignement du sport. Complément idéal au BPJEPS pour les coachs souhaitant se spécialiser ou évoluer vers l'encadrement de sportifs de haut niveau.",
    jobTitle: "Coach sportif / Éducateur sportif",
    isRequired: false,
    alternance: false,
    schools: [
      { name: "Université Paris-Saclay – UFR STAPS", city: "Orsay", region: "Île-de-France", type: "public", url: "https://www.universite-paris-saclay.fr" },
      { name: "Université Claude Bernard Lyon 1 – UFR STAPS", city: "Lyon", region: "Auvergne-Rhône-Alpes", type: "public", url: "https://staps.univ-lyon1.fr" },
      { name: "Université Aix-Marseille – UFR STAPS", city: "Marseille", region: "Provence-Alpes-Côte d'Azur", type: "public", url: "https://staps.univ-amu.fr" },
      { name: "Université de Bordeaux – UFR STAPS", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public", url: "https://www.u-bordeaux.fr" },
      { name: "Université de Lille – UFR STAPS", city: "Lille", region: "Hauts-de-France", type: "public", url: "https://staps.univ-lille.fr" },
      { name: "Université de Strasbourg – UFR STAPS", city: "Strasbourg", region: "Grand Est", type: "public", url: "https://staps.unistra.fr" },
      { name: "Université Toulouse 3 Paul Sabatier – UFR STAPS", city: "Toulouse", region: "Occitanie", type: "public", url: "https://www.univ-tlse3.fr" },
      { name: "Université Rennes 2 – UFR STAPS", city: "Rennes", region: "Bretagne", type: "public", url: "https://www.univ-rennes2.fr" },
      { name: "Université de Nantes – UFR STAPS", city: "Nantes", region: "Pays de la Loire", type: "public", url: "https://www.univ-nantes.fr" },
    ],
  },

  // -------------------------------------------------------------------------
  // CQP — Certificats de Qualification Professionnelle (branche sport)
  // Note : Les CQP sont délivrés par des centres agréés CPNEF-Sport.
  // La liste complète et à jour des centres agréés est sur cpnefsport.fr.
  // -------------------------------------------------------------------------
  {
    id: "cqp-instructeur-fitness",
    profession: "coach",
    diploma: "CQP Instructeur Fitness",
    diplomaType: "cqp",
    duration: "4 à 6 mois",
    minLevel: "bac",
    cost: "1 500 – 3 000 € (financement CPF possible)",
    description:
      "Certificat de Qualification Professionnelle délivré par la branche professionnelle du sport (CPNEF-Sport). Permet d'encadrer des cours collectifs et du coaching individuel en salle. Reconnu par les employeurs du fitness mais ne remplace pas le BPJEPS pour exercer en indépendant rémunéré. Idéal comme première étape avant le BPJEPS.",
    jobTitle: "Instructeur fitness (salarié ou en complément d'un BPJEPS)",
    isRequired: false,
    alternance: true,
    schools: [
      {
        name: "CPNEF-Sport — annuaire des centres agréés",
        city: "Réseau national",
        region: "Île-de-France",
        type: "private",
        url: "https://www.cpnefsport.fr",
      },
    ],
  },

  {
    id: "cqp-educateur-sportif",
    profession: "coach",
    diploma: "CQP Éducateur Sportif",
    diplomaType: "cqp",
    duration: "6 à 12 mois",
    minLevel: "bac",
    cost: "2 000 – 4 000 € (financement CPF possible)",
    description:
      "CQP plus complet que l'Instructeur Fitness, il couvre l'animation sportive généraliste et l'encadrement de publics variés. Plusieurs mentions disponibles selon la discipline (arts martiaux, natation, sports collectifs). Délivré par les fédérations sportives via la CPNEF-Sport.",
    jobTitle: "Éducateur sportif (salarié en club ou association)",
    isRequired: false,
    alternance: true,
    schools: [
      {
        name: "CPNEF-Sport — annuaire des centres agréés",
        city: "Réseau national",
        region: "Île-de-France",
        type: "private",
        url: "https://www.cpnefsport.fr",
      },
    ],
  },

  {
    id: "cqp-animateur-loisirs-sportifs",
    profession: "coach",
    diploma: "CQP Animateur de Loisirs Sportifs (ALS)",
    diplomaType: "cqp",
    duration: "3 à 5 mois",
    minLevel: "bac",
    cost: "1 000 – 2 000 € (financement CPF possible)",
    description:
      "Le CQP le plus accessible de la branche sport. Permet d'animer des activités physiques de loisir auprès du grand public. Souvent utilisé comme tremplin avant le BPJEPS ou comme complément d'activité. Ne permet pas d'exercer comme indépendant rémunéré sans un diplôme d'État supplémentaire.",
    jobTitle: "Animateur sportif (loisirs, associations, clubs)",
    isRequired: false,
    alternance: false,
    schools: [
      {
        name: "CPNEF-Sport — annuaire des centres agréés",
        city: "Réseau national",
        region: "Île-de-France",
        type: "private",
        url: "https://www.cpnefsport.fr",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // PRÉPARATEUR PHYSIQUE
  // -------------------------------------------------------------------------
  {
    id: "deust-staps-atp",
    profession: "physical_trainer",
    diploma: "DEUST STAPS – Activités physiques pour Tout Public",
    diplomaType: "university",
    duration: "2 ans",
    minLevel: "bac",
    cost: "Gratuit (~200 €/an)",
    description:
      "Diplôme universitaire Bac+2 permettant d'exercer comme préparateur physique assistant ou coach généraliste. Constitue une passerelle vers la Licence STAPS pour les étudiants souhaitant approfondir leur formation.",
    jobTitle: "Préparateur physique assistant / Coach généraliste",
    isRequired: false,
    alternance: false,
    schools: [
      { name: "Université Claude Bernard Lyon 1 – UFR STAPS", city: "Lyon", region: "Auvergne-Rhône-Alpes", type: "public", url: "https://staps.univ-lyon1.fr" },
      { name: "Université de Bordeaux – UFR STAPS", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public", url: "https://www.u-bordeaux.fr" },
      { name: "Université de Lille – UFR STAPS", city: "Lille", region: "Hauts-de-France", type: "public", url: "https://staps.univ-lille.fr" },
      { name: "Université Aix-Marseille – UFR STAPS", city: "Marseille", region: "Provence-Alpes-Côte d'Azur", type: "public", url: "https://staps.univ-amu.fr" },
      { name: "Université Paris-Saclay – UFR STAPS", city: "Orsay", region: "Île-de-France", type: "public", url: "https://www.universite-paris-saclay.fr" },
    ],
  },

  {
    id: "licence-master-staps-entrainement",
    profession: "physical_trainer",
    diploma: "Licence + Master STAPS – Entraînement Sportif",
    diplomaType: "university",
    duration: "5 ans (Licence 3 ans + Master 2 ans)",
    minLevel: "bac",
    cost: "Gratuit (~200 €/an)",
    description:
      "Formation universitaire complète pour devenir préparateur physique auprès de sportifs de haut niveau, de clubs professionnels ou d'athlètes en quête de performance. Le Master spécialise dans l'analyse de la performance et la planification de l'entraînement.",
    jobTitle: "Préparateur physique",
    isRequired: false,
    alternance: false,
    schools: [
      { name: "INSEP – Institut National du Sport, de l'Expertise et de la Performance", city: "Paris", region: "Île-de-France", type: "public", url: "https://www.insep.fr" },
      { name: "Université Claude Bernard Lyon 1 – UFR STAPS", city: "Lyon", region: "Auvergne-Rhône-Alpes", type: "public", url: "https://staps.univ-lyon1.fr" },
      { name: "Université de Bordeaux – UFR STAPS", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public", url: "https://www.u-bordeaux.fr" },
      { name: "Université de Lille – UFR STAPS", city: "Lille", region: "Hauts-de-France", type: "public", url: "https://staps.univ-lille.fr" },
      { name: "Université de Strasbourg – UFR STAPS", city: "Strasbourg", region: "Grand Est", type: "public", url: "https://staps.unistra.fr" },
      { name: "Université Aix-Marseille – UFR STAPS", city: "Marseille", region: "Provence-Alpes-Côte d'Azur", type: "public", url: "https://staps.univ-amu.fr" },
      { name: "Université de Montpellier – UFR STAPS", city: "Montpellier", region: "Occitanie", type: "public", url: "https://staps.umontpellier.fr" },
      { name: "Université Rennes 2 – UFR STAPS", city: "Rennes", region: "Bretagne", type: "public", url: "https://www.univ-rennes2.fr" },
    ],
  },

  // -------------------------------------------------------------------------
  // KINÉSITHÉRAPEUTE
  // -------------------------------------------------------------------------
  {
    id: "demk",
    profession: "kine",
    diploma: "Diplôme d'État de Masseur-Kinésithérapeute (DEMK)",
    diplomaType: "state",
    duration: "4 ans (après PASS/L.AS)",
    minLevel: "bac",
    cost: "Gratuit en IFMK public (~500 €/an) · 7 000 – 14 000 €/an en IFMK privé",
    description:
      "Diplôme d'État obligatoire pour exercer la kinésithérapie en France. L'entrée se fait via le concours PASS ou L.AS (1ère année commune de santé). La formation dure 4 ans en Institut de Formation en Masso-Kinésithérapie (IFMK), incluant de nombreux stages cliniques.",
    jobTitle: "Masseur-Kinésithérapeute",
    isRequired: true,
    alternance: false,
    schools: [
      { name: "IFMK APHP – AP-HP Paris", city: "Paris", region: "Île-de-France", type: "public", url: "https://ifmk.aphp.fr" },
      { name: "EFOM Boris Dolto", city: "Paris", region: "Île-de-France", type: "private", url: "https://www.efom.fr" },
      { name: "IFMK de Lyon – CHU de Lyon", city: "Lyon", region: "Auvergne-Rhône-Alpes", type: "public" },
      { name: "IFMK de Marseille – AP-HM", city: "Marseille", region: "Provence-Alpes-Côte d'Azur", type: "public" },
      { name: "IFMK de Bordeaux – CHU de Bordeaux", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public" },
      { name: "IFMK de Lille – CHU de Lille", city: "Lille", region: "Hauts-de-France", type: "public" },
      { name: "IFMK de Nantes – CHU de Nantes", city: "Nantes", region: "Pays de la Loire", type: "public" },
      { name: "IFMK de Strasbourg – CHU de Strasbourg", city: "Strasbourg", region: "Grand Est", type: "public" },
      { name: "IFMK de Rennes – CHU de Rennes", city: "Rennes", region: "Bretagne", type: "public" },
      { name: "IFMK de Toulouse – CHU de Toulouse", city: "Toulouse", region: "Occitanie", type: "public" },
    ],
  },

  // -------------------------------------------------------------------------
  // OSTÉOPATHE
  // -------------------------------------------------------------------------
  {
    id: "do-osteo",
    profession: "osteo",
    diploma: "Diplôme d'Ostéopathe (D.O.) – École agréée Ministère de la Santé",
    diplomaType: "private_accredited",
    duration: "5 ans",
    minLevel: "bac",
    cost: "8 000 – 12 000 €/an",
    description:
      "Titre d'ostéopathe protégé par la loi depuis 2002. Formation de 5 ans (3 000 heures minimum) dans une école agréée par le Ministère de la Santé. Environ 30 écoles agréées en France. Le débouché principal est l'exercice libéral.",
    jobTitle: "Ostéopathe",
    isRequired: true,
    alternance: false,
    schools: [
      { name: "IFOGA – Institut de Formation en Ostéopathie du Grand Avignon", city: "Avignon", region: "Provence-Alpes-Côte d'Azur", type: "private", url: "https://www.ifoga.fr" },
      { name: "Collège Ostéopathique Européen", city: "Paris", region: "Île-de-France", type: "private", url: "https://www.osteo-europe.com" },
      { name: "ITO – Institut Toulousain d'Ostéopathie", city: "Toulouse", region: "Occitanie", type: "private", url: "https://www.osteo-ito.fr" },
      { name: "Liste officielle des écoles agréées (Ministère de la Santé)", city: "France entière", region: "Île-de-France", type: "public", url: "https://www.sante.gouv.fr/professionnels/se-former-s-installer-exercer/les-ecoles-agreees-pour-la-formation-en-osteopathie" },
    ],
  },

  // -------------------------------------------------------------------------
  // MÉDECIN DU SPORT
  // -------------------------------------------------------------------------
  {
    id: "medecine-sport",
    profession: "sports_doctor",
    diploma: "PASS/L.AS + Diplôme d'État de Docteur en Médecine + DU Médecine du Sport",
    diplomaType: "university",
    duration: "9 à 11 ans",
    minLevel: "bac",
    cost: "Gratuit à l'université (frais ~500 €/an)",
    description:
      "Médecin généraliste ou spécialiste titulaire d'un Diplôme Universitaire (DU) en médecine du sport. Parcours long mais unique en France pour assurer le suivi médical complet de sportifs avec actes médicaux. L'entrée en première année de médecine (PASS ou L.AS) est soumise à un concours très sélectif.",
    jobTitle: "Médecin du sport",
    isRequired: true,
    alternance: false,
    schools: [
      { name: "Faculté de Médecine – Université Paris Cité", city: "Paris", region: "Île-de-France", type: "public", url: "https://medecine.u-paris.fr" },
      { name: "Faculté de Médecine Lyon Est – Université Claude Bernard Lyon 1", city: "Lyon", region: "Auvergne-Rhône-Alpes", type: "public", url: "https://www.univ-lyon1.fr" },
      { name: "Faculté de Médecine – Université Aix-Marseille", city: "Marseille", region: "Provence-Alpes-Côte d'Azur", type: "public", url: "https://medecine.univ-amu.fr" },
      { name: "Faculté de Médecine – Université de Bordeaux", city: "Bordeaux", region: "Nouvelle-Aquitaine", type: "public", url: "https://www.u-bordeaux.fr" },
      { name: "Faculté de Médecine – Université de Lille", city: "Lille", region: "Hauts-de-France", type: "public", url: "https://medecine.univ-lille.fr" },
      { name: "Faculté de Médecine – Université de Strasbourg", city: "Strasbourg", region: "Grand Est", type: "public", url: "https://medecine.unistra.fr" },
      { name: "Faculté de Médecine – Université Toulouse III Paul Sabatier", city: "Toulouse", region: "Occitanie", type: "public", url: "https://www.univ-tlse3.fr" },
    ],
  },
];
