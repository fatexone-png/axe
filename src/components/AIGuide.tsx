"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

interface Category {
  icon: string;
  label: string;
  questions: string[];
}

// ---------------------------------------------------------------------------
// Données : catégories et questions preset
// ---------------------------------------------------------------------------

const CATEGORIES: Category[] = [
  {
    icon: "🏛",
    label: "URSSAF & Cotisations",
    questions: [
      "Quel est mon taux de cotisation ?",
      "Comment déclarer mon chiffre d'affaires ?",
      "Quand dois-je payer mes cotisations ?",
    ],
  },
  {
    icon: "🛡",
    label: "RC Pro & Assurances",
    questions: [
      "Suis-je obligé d'avoir une RC Pro ?",
      "Quel est le coût moyen d'une RC Pro coach ?",
      "Que couvre exactement la RC Pro ?",
    ],
  },
  {
    icon: "🧾",
    label: "Facturation",
    questions: [
      "Comment créer une facture conforme ?",
      "Dois-je facturer la TVA ?",
      "Qu'est-ce que la facturation électronique 2026 ?",
    ],
  },
  {
    icon: "📈",
    label: "Retraite & PER",
    questions: [
      "Comment fonctionne ma retraite en tant qu'indépendant ?",
      "Qu'est-ce qu'un PER et comment en ouvrir un ?",
      "PER vs Madelin : quelle différence ?",
    ],
  },
  {
    icon: "🏥",
    label: "Arrêt maladie",
    questions: [
      "Ai-je droit à des indemnités si je suis malade ?",
      "Combien touché-je en cas d'arrêt de travail ?",
      "Comment la prévoyance complète mes droits SSI ?",
    ],
  },
];

const WELCOME_MESSAGE =
  "Bonjour ! Je suis GetAxe Guide, votre assistant pour toutes vos questions d'indépendant du sport et de la santé. Choisissez une question dans le menu ou posez-moi directement votre question.";

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      <span
        className="w-2 h-2 rounded-full bg-axe-accent animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-axe-accent animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-2 h-2 rounded-full bg-axe-accent animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="bg-axe-accent/15 border border-axe-accent/20 text-axe-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function AssistantMessage({
  content,
  loading = false,
}: {
  content: string;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-start">
      <div className="bg-axe-charcoal text-axe-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
        {loading ? <LoadingDots /> : content}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export default function AIGuide() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCategory, setOpenCategory] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = (await res.json()) as { content?: string; error?: string };

      const assistantContent =
        data.content ??
        data.error ??
        "Une erreur inattendue est survenue. Veuillez réessayer.";

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: assistantContent },
      ]);
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handlePresetQuestion(question: string) {
    setOpenCategory(null);
    sendMessage(question);
  }

  function handleNewConversation() {
    setMessages([]);
    setInput("");
    setOpenCategory(null);
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex rounded-2xl border border-white/10 overflow-hidden bg-axe-dark min-h-[620px] shadow-2xl">
      {/* ----------------------------------------------------------------- */}
      {/* Sidebar                                                            */}
      {/* ----------------------------------------------------------------- */}
      <aside className="w-[280px] flex-shrink-0 bg-axe-charcoal border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-axe-accent flex items-center justify-center">
              <span className="text-axe-black font-black text-xs">AXE</span>
            </div>
            <span className="text-axe-white font-bold text-sm">Guide IA</span>
          </div>
          <p className="text-axe-muted text-xs leading-snug">
            Indépendants du sport &amp; de la santé
          </p>
        </div>

        {/* Questions fréquentes */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-axe-muted text-xs font-semibold uppercase tracking-wider mb-3">
            Questions fréquentes
          </p>
        </div>

        {/* Catégories */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {CATEGORIES.map((cat, idx) => (
            <div key={cat.label}>
              {/* En-tête de catégorie */}
              <button
                onClick={() =>
                  setOpenCategory(openCategory === idx ? null : idx)
                }
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">{cat.icon}</span>
                  <span className="text-axe-white text-xs font-medium truncate">
                    {cat.label}
                  </span>
                </span>
                <svg
                  className={`w-3 h-3 text-axe-muted flex-shrink-0 transition-transform duration-200 ${
                    openCategory === idx ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Questions */}
              {openCategory === idx && (
                <div className="mt-1 ml-5 space-y-0.5">
                  {cat.questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handlePresetQuestion(q)}
                      disabled={loading}
                      className="w-full text-left px-3 py-2 rounded-lg text-axe-muted hover:text-axe-white hover:bg-white/5 text-xs transition-colors leading-snug disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Nouvelle conversation */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-axe-muted hover:text-axe-white hover:border-white/20 text-xs font-medium transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nouvelle conversation
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------------------- */}
      {/* Zone de chat                                                       */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {/* Message d'accueil */}
          {isEmpty && (
            <AssistantMessage content={WELCOME_MESSAGE} />
          )}

          {/* Historique */}
          {messages.map((msg, idx) =>
            msg.role === "user" ? (
              <UserMessage key={idx} content={msg.content} />
            ) : (
              <AssistantMessage key={idx} content={msg.content} />
            )
          )}

          {/* Indicateur de chargement */}
          {loading && <AssistantMessage content="" loading />}

          {/* Ancre de scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Zone de saisie */}
        <div className="px-6 py-4 border-t border-white/10 bg-axe-dark">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Posez votre question… (Entrée pour envoyer, Shift+Entrée pour sauter une ligne)"
              rows={1}
              className="bg-axe-dark border border-white/10 rounded-xl px-4 py-3 text-axe-white flex-1 text-sm placeholder:text-axe-muted resize-none leading-relaxed focus:outline-none focus:border-axe-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: "48px", maxHeight: "160px" }}
              onInput={(e) => {
                const target = e.currentTarget;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              aria-label="Envoyer"
              className="bg-axe-accent text-axe-black rounded-xl px-5 py-3 font-bold text-sm flex-shrink-0 hover:bg-axe-accentDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-axe-muted/40 text-xs mt-2 text-center">
            Informations indicatives 2024-2026 — Consultez un expert-comptable pour vos décisions importantes
          </p>
        </div>
      </div>
    </div>
  );
}
