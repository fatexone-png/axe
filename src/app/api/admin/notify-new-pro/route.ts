import { NextRequest, NextResponse } from "next/server";
import { emailNewProAdminNotification } from "@/lib/email";
import { PROFESSION_LABELS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { name, email, profession } = await req.json();
    const professionLabel = PROFESSION_LABELS[profession] ?? profession;
    await emailNewProAdminNotification({ proName: name, proEmail: email, profession: professionLabel });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("notify-new-pro error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
