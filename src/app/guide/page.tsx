"use client";

/**
 * Page /guide — AXE Guide IA
 *
 * CONFIGURATION REQUISE :
 * Créez un fichier .env.local à la racine du projet et ajoutez :
 *   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
 *
 * Obtenez votre clé API sur : https://console.anthropic.com/
 */

import AIGuide from "@/components/AIGuide";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-axe-black pt-20">
      {/* Hero compact */}
      <div className="text-center py-8 px-4">
        <div className="inline-block bg-axe-accent/10 border border-axe-accent/20 rounded-full px-4 py-1.5 text-axe-accent text-xs font-semibold mb-4 uppercase tracking-wider">
          Propulsé par Claude AI
        </div>
        <h1 className="text-3xl font-bold text-axe-white mb-2">AXE Guide IA</h1>
        <p className="text-axe-muted">
          Vos questions d&apos;indépendant, répondues 24h/24
        </p>
      </div>

      {/* Composant chat */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <AIGuide />
      </div>

      {/* Disclaimer légal */}
      <p className="text-center text-xs text-axe-muted/50 pb-8 px-4">
        Les réponses sont fournies à titre indicatif. Consultez un expert-comptable pour des conseils personnalisés.
      </p>
    </div>
  );
}
