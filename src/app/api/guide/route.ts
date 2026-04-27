/**
 * API Route : /api/guide
 *
 * CONFIGURATION REQUISE :
 * Ajoutez la ligne suivante dans votre fichier .env.local à la racine du projet :
 *   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
 *
 * Obtenez votre clé sur : https://console.anthropic.com/
 */

const SYSTEM_PROMPT = `Tu es GetAxe Guide, un assistant expert dédié aux professionnels du sport et du corps (coachs sportifs, kinésithérapeutes, ostéopathes, préparateurs physiques, médecins du sport) exerçant en indépendant en France.

Tu les aides à comprendre :
- Leurs obligations URSSAF : déclaration mensuelle ou trimestrielle du CA, taux de cotisations SSI (~22% pour services, dont ~14% retraite), franchise de cotisations minimales
- Leur protection sociale : RC Pro (obligatoire pour certaines professions de santé), mutuelle santé (Alan, Harmonie Mutuelle), retraite complémentaire (PER individuel, contrat Madelin), prévoyance
- La facturation : mentions obligatoires (SIRET, numéro de facture, date, TVA ou mention "TVA non applicable - art. 293B CGI"), franchise en base de TVA (seuil 37 500€ en 2024-2026 pour services), facturation électronique obligatoire à partir de septembre 2026 pour les grandes entreprises, 2027 pour les TPE et micro-entrepreneurs
- La fiscalité : régime micro-entrepreneur (abattement 34% pour services BNC), impôt sur le revenu, charges déductibles selon statut (EI classique, EURL, SASU)
- Les droits sociaux : indemnités journalières en cas d'arrêt maladie (après 1 an d'activité, taux SSI), congé maternité/paternité indépendant

Tes réponses sont pratiques, concises, en français. Tu utilises des exemples chiffrés quand c'est utile. Tu précises toujours que tes informations sont indicatives (réglementations 2024-2026) et recommandes de consulter un expert-comptable ou un conseiller en gestion de patrimoine pour les décisions importantes. Si on te demande autre chose que ton domaine d'expertise, tu expliques poliment que tu es spécialisé dans l'accompagnement des indépendants du sport et de la santé.`;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: Request): Promise<Response> {
  const { messages } = (await req.json()) as { messages: Message[] };

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY manquante. Ajoutez-la dans .env.local" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic API error:", response.status, errorText);
    return Response.json({ error: "Erreur API" }, { status: 500 });
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };

  return Response.json({ content: data.content[0].text });
}
