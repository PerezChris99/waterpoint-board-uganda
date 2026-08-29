import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://waterpointboarduganda.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const waterPoints = await prisma.waterPoint.findMany({ select: { id: true, updatedAt: true } });

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/water-points`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/data-methodology`, changeFrequency: "monthly", priority: 0.3 },
    ...waterPoints.map((wp) => ({
      url: `${siteUrl}/water-points/${wp.id}`,
      lastModified: wp.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
