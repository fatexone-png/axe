import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";


export const metadata: Metadata = {
  title: {
    default: "GetAxe — La plateforme des pros du sport & de la santé",
    template: "%s | GetAxe",
  },
  description: "Trouvez le meilleur coach, kiné ou ostéopathe certifié près de chez vous. Professionnels vérifiés, assurés et disponibles.",
  keywords: ["coach sportif", "kinésithérapeute", "ostéopathe", "indépendant", "sport", "santé", "France"],
  openGraph: {
    title: "GetAxe — Experts sport & santé certifiés",
    description: "La plateforme qui connecte clients et professionnels du sport et de la santé. Vérifiés, assurés, disponibles.",
    type: "website",
    locale: "fr_FR",
    siteName: "GetAxe",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetAxe — Experts sport & santé certifiés",
    description: "La plateforme qui connecte clients et professionnels du sport et de la santé.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
