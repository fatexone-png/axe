import { ClientRequest } from "@/lib/types";
import { formatDate } from "@/lib/firestore";
import StatusBadge from "./StatusBadge";
import { PROFESSION_LABELS } from "@/lib/constants";

interface Props {
  request: ClientRequest;
  minimal?: boolean;
}

const GOAL_LABELS: Record<string, string> = {
  pain: "Douleur",
  sport_return: "Reprise sportive",
  weight_loss: "Perte de poids",
  performance: "Performance",
  re_athletization: "Réathlétisation",
  mobility: "Mobilité",
  combat_prep: "Préparation combat",
  fitness: "Remise en forme",
  other: "Autre",
};

export default function RequestCard({ request, minimal }: Props) {
  return (
    <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-axe-white">
            {request.firstName} {request.lastName}
          </p>
          <p className="text-xs text-axe-muted">
            {request.city} {request.postalCode}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag>{GOAL_LABELS[request.goal] ?? request.goal}</Tag>
        <Tag>{request.bodyArea}</Tag>
        <Tag>{PROFESSION_LABELS[request.preferredProfession] ?? request.preferredProfession}</Tag>
      </div>

      {!minimal && (
        <>
          <p className="text-xs text-axe-muted">{request.message || "Pas de message."}</p>
          <div className="flex items-center justify-between text-xs text-axe-muted pt-1 border-t border-white/5">
            <span>Budget : {request.budget}</span>
            <span>{formatDate(request.createdAt as never)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs bg-axe-grey/50 text-axe-muted px-2 py-0.5 rounded-md">{children}</span>
  );
}
