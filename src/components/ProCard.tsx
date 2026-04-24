import { Professional } from "@/lib/types";
import { formatDate } from "@/lib/firestore";
import { PROFESSION_LABELS } from "@/lib/constants";
import StatusBadge from "./StatusBadge";

interface Props {
  pro: Professional;
  minimal?: boolean;
}

export default function ProCard({ pro, minimal }: Props) {
  return (
    <div className="bg-axe-charcoal border border-white/5 rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-axe-white">
            {pro.firstName} {pro.lastName}
          </p>
          <p className="text-sm text-axe-accent">
            {PROFESSION_LABELS[pro.profession] ?? pro.profession}
          </p>
          <p className="text-xs text-axe-muted mt-0.5">
            {pro.locations?.length
              ? pro.locations.map((l) => l.city).join(" · ")
              : `${pro.city} ${pro.postalCode}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={pro.status} />
          <StatusBadge status={pro.trustLevel} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {pro.specialties.slice(0, 4).map((s) => (
          <span key={s} className="text-xs bg-axe-grey/50 text-axe-muted px-2 py-0.5 rounded-md">{s}</span>
        ))}
      </div>

      {!minimal && (
        <>
          <p className="text-xs text-axe-muted line-clamp-2">{pro.bio || "Pas de bio."}</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-axe-muted pt-1 border-t border-white/5">
            <span>RC Pro : <strong className={pro.hasInsurance ? "text-green-400" : "text-red-400"}>{pro.hasInsurance ? "Oui" : "Non"}</strong></span>
            <span>Expérience : <strong className="text-axe-white">{pro.experienceYears} ans</strong></span>
            <span className="col-span-2">Diplôme : {pro.diploma}</span>
            {pro.rppsOrAdeli && <span className="col-span-2">RPPS/ADELI : {pro.rppsOrAdeli}</span>}
          </div>
          <p className="text-xs text-axe-muted text-right">{formatDate(pro.createdAt as never)}</p>
        </>
      )}
    </div>
  );
}
