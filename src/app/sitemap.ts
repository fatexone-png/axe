import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://axe.fr", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://axe.fr/annuaire", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://axe.fr/guide", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://axe.fr/pro", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://axe.fr/demande", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://axe.fr/legal", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
