import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = "GetAxe <noreply@bfzoom.fr>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://getaxe.fr";

// ─── Template de base ─────────────────────────────────────────────────────────

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:22px;font-weight:900;color:#C8FF00;letter-spacing:-0.5px;">GetAxe</span>
      </td></tr>
      <tr><td style="background:#1A1A1A;border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px 36px;">
        ${content}
      </td></tr>
      <tr><td style="padding-top:24px;text-align:center;">
        <p style="color:#444;font-size:12px;margin:0;">
          GetAxe Platform &middot; <a href="${APP_URL}" style="color:#444;text-decoration:none;">getaxe.fr</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// ─── Helpers de style ─────────────────────────────────────────────────────────

const H = `font-size:20px;font-weight:700;color:#FFFFFF;margin:0 0 6px 0;line-height:1.3;`;
const P = `font-size:14px;color:#888;line-height:1.7;margin:0 0 16px 0;`;
const LBL = `font-size:11px;color:#555;text-transform:uppercase;letter-spacing:.06em;margin:0 0 3px 0;`;
const VAL = `font-size:14px;color:#FFFFFF;font-weight:600;margin:0 0 14px 0;`;
const BIG = `font-size:30px;font-weight:900;color:#C8FF00;margin:0 0 4px 0;`;
const HR = `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:22px 0;">`;

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#C8FF00;color:#0D0D0D;font-weight:700;font-size:14px;padding:12px 26px;border-radius:10px;text-decoration:none;margin-top:8px;">${label}</a>`;
}

function fmtDate(d: string): string {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

// ─── Envoi sécurisé (ne bloque jamais la réponse principale) ──────────────────

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY manquant — email non envoyé :", subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error("[email] Échec d'envoi :", subject, err);
  }
}

// ─── Emails ───────────────────────────────────────────────────────────────────

export interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  proEmail: string;
  sessionType: string;
  sessionDate: string;
  slotTime?: string;
  sessionLocation?: string;
  amountEuros: number;
  proPayoutEuros: number;
}

/** Client : paiement confirmé */
export async function emailBookingConfirmedClient(d: BookingEmailData) {
  const date = fmtDate(d.sessionDate);
  await send(
    d.clientEmail,
    "Votre réservation est confirmée — GetAxe",
    base(`
      <p style="${H}">Réservation confirmée ✓</p>
      <p style="${P}">Bonjour ${d.clientName}, votre paiement a bien été reçu.</p>
      ${HR}
      <p style="${LBL}">Séance</p><p style="${VAL}">${d.sessionType}</p>
      <p style="${LBL}">Date</p><p style="${VAL}">${date}${d.slotTime ? ` à ${d.slotTime}` : ""}</p>
      ${d.sessionLocation ? `<p style="${LBL}">Lieu</p><p style="${VAL}">${d.sessionLocation}</p>` : ""}
      <p style="${LBL}">Montant payé</p><p style="${BIG}">${d.amountEuros} €</p>
      ${HR}
      <p style="${P}">Une fois la séance effectuée, confirmez-la depuis votre espace pour libérer le paiement au professionnel.</p>
      ${btn(`${APP_URL}/dashboard/client`, "Voir mes réservations →")}
    `)
  );
}

/** Pro : nouvelle réservation */
export async function emailBookingConfirmedPro(d: BookingEmailData) {
  const date = fmtDate(d.sessionDate);
  await send(
    d.proEmail,
    "Nouvelle réservation — GetAxe",
    base(`
      <p style="${H}">Nouvelle réservation 🎯</p>
      <p style="${P}">Un client vient de réserver une séance avec vous.</p>
      ${HR}
      <p style="${LBL}">Client</p><p style="${VAL}">${d.clientName}</p>
      <p style="${LBL}">Séance</p><p style="${VAL}">${d.sessionType}</p>
      <p style="${LBL}">Date</p><p style="${VAL}">${date}${d.slotTime ? ` à ${d.slotTime}` : ""}</p>
      ${d.sessionLocation ? `<p style="${LBL}">Lieu</p><p style="${VAL}">${d.sessionLocation}</p>` : ""}
      <p style="${LBL}">Votre rémunération (92 %)</p><p style="${BIG}">${d.proPayoutEuros} €</p>
      ${HR}
      <p style="${P}">Le paiement sera libéré dès que le client confirme la séance.</p>
      ${btn(`${APP_URL}/dashboard`, "Voir mes réservations →")}
    `)
  );
}

/** Client : annulation */
export async function emailCancellationClient(d: {
  clientName: string;
  clientEmail: string;
  sessionType: string;
  sessionDate: string;
  refundEuros: number;
  cancelledBy: "client" | "pro";
  promoCode?: string;
}) {
  const date = fmtDate(d.sessionDate);
  const byPro = d.cancelledBy === "pro";
  await send(
    d.clientEmail,
    "Réservation annulée — GetAxe",
    base(`
      <p style="${H}">Réservation annulée</p>
      <p style="${P}">
        Bonjour ${d.clientName},
        ${byPro ? "le professionnel a annulé" : "vous avez annulé"}
        la séance <strong style="color:#fff;">${d.sessionType}</strong> du ${date}.
      </p>
      ${HR}
      ${d.refundEuros > 0
        ? `<p style="${LBL}">Remboursement</p>
           <p style="${BIG}">${d.refundEuros} €</p>
           <p style="${P}">Le remboursement sera crédité sur votre moyen de paiement sous 5 à 10 jours ouvrés.</p>`
        : `<p style="${P}">Aucun remboursement n'est dû selon la politique d'annulation du professionnel.</p>`
      }
      ${d.promoCode
        ? `${HR}
           <p style="${P}">Le professionnel vous offre un code promo pour compenser :</p>
           <p style="font-size:26px;font-weight:900;color:#C8FF00;letter-spacing:3px;margin:8px 0 12px;">${d.promoCode}</p>
           <p style="${P}">À utiliser lors de votre prochaine réservation.</p>`
        : ""
      }
      ${btn(`${APP_URL}/annuaire`, "Trouver un professionnel →")}
    `)
  );
}

/** Pro + client : facture envoyée */
export async function emailInvoiceSentClient(d: {
  clientEmail: string;
  clientName: string;
  proName: string;
  invoiceNumber: string;
  totalTTC: number;
  issuedAt: string;
  dueAt: string;
}) {
  const issued = fmtDate(d.issuedAt);
  const due = fmtDate(d.dueAt);
  const amount = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(d.totalTTC);
  await send(
    d.clientEmail,
    `Votre facture ${d.invoiceNumber} — GetAxe`,
    base(`
      <p style="${H}">Votre facture est disponible</p>
      <p style="${P}">Bonjour ${d.clientName}, ${d.proName} vous a adressé une facture via GetAxe.</p>
      ${HR}
      <p style="${LBL}">Numéro</p><p style="${VAL}">${d.invoiceNumber}</p>
      <p style="${LBL}">Date d'émission</p><p style="${VAL}">${issued}</p>
      <p style="${LBL}">Date d'échéance</p><p style="${VAL}">${due}</p>
      <p style="${LBL}">Montant total</p><p style="${BIG}">${amount}</p>
      ${HR}
      <p style="${P}">Connectez-vous à votre espace pour consulter et télécharger le PDF.</p>
      ${btn(`${APP_URL}/dashboard/client`, "Voir ma facture →")}
    `)
  );
}

/** Pro : annulation par le client */
export async function emailCancellationPro(d: {
  proEmail: string;
  clientName: string;
  sessionType: string;
  sessionDate: string;
  refundEuros: number;
}) {
  const date = fmtDate(d.sessionDate);
  await send(
    d.proEmail,
    "Un client a annulé sa réservation — GetAxe",
    base(`
      <p style="${H}">Réservation annulée</p>
      <p style="${P}">
        <strong style="color:#fff;">${d.clientName}</strong> a annulé la séance
        <strong style="color:#fff;">${d.sessionType}</strong> prévue le ${date}.
      </p>
      ${HR}
      <p style="${LBL}">Remboursement au client</p>
      <p style="${VAL}">${d.refundEuros} €</p>
      <p style="${P}">Aucun paiement ne sera effectué pour cette séance.</p>
      ${btn(`${APP_URL}/dashboard`, "Voir mon tableau de bord →")}
    `)
  );
}

/** Pro : paiement libéré après confirmation */
export async function emailPaymentReleasedPro(d: {
  proEmail: string;
  clientName: string;
  sessionType: string;
  sessionDate: string;
  proPayoutEuros: number;
}) {
  const date = fmtDate(d.sessionDate);
  await send(
    d.proEmail,
    "Paiement libéré — GetAxe",
    base(`
      <p style="${H}">Paiement libéré 💸</p>
      <p style="${P}">
        La séance avec <strong style="color:#fff;">${d.clientName}</strong> a été confirmée.
        Votre paiement est en cours de virement.
      </p>
      ${HR}
      <p style="${LBL}">Séance</p><p style="${VAL}">${d.sessionType} — ${date}</p>
      <p style="${LBL}">Montant viré (92 %)</p><p style="${BIG}">${d.proPayoutEuros} €</p>
      ${HR}
      <p style="${P}">Le virement apparaîtra sur votre compte bancaire sous 2 à 5 jours ouvrés.</p>
      ${btn(`${APP_URL}/dashboard`, "Voir mes paiements →")}
    `)
  );
}

/** Admin : nouvelle inscription d'un professionnel */
export async function emailNewProAdminNotification(d: {
  proName: string;
  proEmail: string;
  profession: string;
}) {
  await send(
    "brice.faradji@gmail.com",
    `[GetAxe Admin] Nouvelle inscription — ${d.proName}`,
    base(`
      <p style="${H}">Nouvelle candidature pro</p>
      <p style="${P}">
        Un professionnel vient de s&apos;inscrire sur GetAxe et attend votre validation.
      </p>
      ${HR}
      <p style="${LBL}">Nom</p><p style="${VAL}">${d.proName}</p>
      <p style="${LBL}">Email</p><p style="${VAL}">${d.proEmail}</p>
      <p style="${LBL}">Profession</p><p style="${VAL}">${d.profession}</p>
      ${HR}
      ${btn(`${APP_URL}/admin`, "Valider le profil →")}
    `)
  );
}
