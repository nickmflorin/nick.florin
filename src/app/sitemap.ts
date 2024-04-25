import { type MetadataRoute } from "next";

import { prisma } from "~/prisma/client";
import { environment } from "~/environment";

const toSiteUrl = (path: `/${string}` = "/"): string => {
  const siteUrl = environment.get("SITE_URL");
  if (siteUrl.endsWith("/")) {
    return `${siteUrl.slice(0, -1)}${path}`;
  }
  return `${siteUrl}${path}`;
};

const getLastUpdatedEducation = async () => {
  const educations = await prisma.education.findMany({ orderBy: { updatedAt: "desc" } });
  if (educations.length > 0) {
    return educations[0].updatedAt;
  }
  return new Date();
};

const getLastUpdatedExperience = async () => {
  const educations = await prisma.experience.findMany({ orderBy: { updatedAt: "desc" } });
  if (educations.length > 0) {
    return educations[0].updatedAt;
  }
  return new Date();
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* Note: The last-updated values here are not truly indicative of when the page would have last
     changed, because there are relational models that can be changed that would not trigger the
     core model to refresh it's last updated date.  For now, this suffices. */
  const baseUrls = [
    {
      url: toSiteUrl(),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: toSiteUrl("/dashboard"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toSiteUrl("/resume/experience"),
      lastModified: await getLastUpdatedExperience(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: toSiteUrl("/resume/education"),
      lastModified: await getLastUpdatedEducation(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ] as const;

  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" } });
  return [
    ...baseUrls,
    ...projects.map(({ slug, updatedAt }) => ({
      url: toSiteUrl(`/projects/${slug}`),
      lastModified: updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
