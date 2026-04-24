const COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  matched: "bg-axe-accent/10 text-axe-accent border-axe-accent/20",
  closed: "bg-axe-muted/10 text-axe-muted border-white/10",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  unverified: "bg-axe-muted/10 text-axe-muted border-white/10",
  verified: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  certified: "bg-axe-accent/10 text-axe-accent border-axe-accent/20",
  elite: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const LABELS: Record<string, string> = {
  new: "Nouvelle",
  contacted: "Contactée",
  matched: "Matchée",
  closed: "Fermée",
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
  unverified: "Non vérifié",
  verified: "Vérifié",
  certified: "Certifié",
  elite: "Elite AXE",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${COLORS[status] ?? "bg-white/5 text-axe-muted border-white/10"}`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
