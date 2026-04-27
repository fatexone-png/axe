"use client";

import { useEffect, useRef, useState } from "react";
import {
  getConversationsByPro,
  getConversationsByClient,
  subscribeToMessages,
  sendMessage,
  markConversationRead,
} from "@/lib/firestore";
import { Conversation, ChatMessage } from "@/lib/types";

interface Props {
  userEmail: string;
  role: "pro" | "client";
  userName: string;
}

function timeLabel(d: Date): string {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "À l'instant";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(d);
}

export default function MessagingPanel({ userEmail, role, userName }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = role === "pro"
      ? getConversationsByPro(userEmail)
      : getConversationsByClient(userEmail);
    load.then((c) => { setConversations(c); setLoading(false); }).catch(() => setLoading(false));
  }, [userEmail, role]);

  useEffect(() => {
    if (!activeConvo?.id) return;
    markConversationRead(activeConvo.id, role).catch(() => {});
    const unsub = subscribeToMessages(activeConvo.id, setMessages);
    return unsub;
  }, [activeConvo, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || !activeConvo?.id) return;
    setSending(true);
    try {
      await sendMessage(activeConvo.id, userEmail, input.trim(), role);
      setInput("");
      setConversations((prev) =>
        prev.map((c) => c.id === activeConvo.id ? { ...c, lastMessage: input.trim(), lastMessageAt: new Date() } : c)
      );
    } finally {
      setSending(false);
    }
  }

  const otherName = (c: Conversation) => role === "pro" ? c.clientName : c.proName;
  const unread = (c: Conversation) => role === "pro" ? c.unreadPro : c.unreadClient;

  // suppress unused warning — userName is available for future use
  void userName;

  if (loading) return <div className="py-16 text-center text-axe-muted text-sm">Chargement…</div>;

  return (
    <div className="flex gap-4 h-[560px]">
      {/* Liste conversations */}
      <div className="w-64 shrink-0 bg-axe-charcoal border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-xs font-semibold text-axe-muted uppercase tracking-wider">Conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-axe-muted text-xs">Aucune conversation</div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveConvo(c); setMessages([]); }}
                className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${activeConvo?.id === c.id ? "bg-axe-accent/5 border-l-2 border-axe-accent" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-axe-white text-sm font-medium truncate">{otherName(c)}</p>
                  {unread(c) > 0 && (
                    <span className="w-5 h-5 bg-axe-accent text-axe-black text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {unread(c)}
                    </span>
                  )}
                </div>
                {c.lastMessage && (
                  <p className="text-axe-muted text-xs truncate mt-0.5">{c.lastMessage}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 bg-axe-charcoal border border-white/5 rounded-2xl flex flex-col overflow-hidden">
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-axe-muted text-sm">Sélectionnez une conversation</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-white/5 shrink-0">
              <p className="text-axe-white font-semibold text-sm">{otherName(activeConvo)}</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m) => {
                const isMine = m.from === userEmail;
                const date = m.createdAt instanceof Date
                  ? m.createdAt
                  : (m.createdAt as { toDate?: () => Date }).toDate?.() ?? new Date();
                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-axe-accent text-axe-black font-medium" : "bg-axe-dark text-axe-white border border-white/5"}`}>
                      <p className="leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? "text-axe-black/60" : "text-axe-muted"}`}>{timeLabel(date)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="px-4 py-3 border-t border-white/5 flex gap-2 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Votre message…"
                className="flex-1 bg-axe-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-axe-white placeholder-axe-muted focus:outline-none focus:border-axe-accent/40 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="bg-axe-accent text-axe-black font-bold text-sm px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
