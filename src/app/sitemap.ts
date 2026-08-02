import { type MetadataRoute } from 'next';

import { db } from '~/database/prisma';

import { environment } from '~/environment';

const toSiteUrl = (path: `/${string}` = '/'): string => {
  const siteUrl = environment.get('SITE_URL');
  if (siteUrl.endsWith('/')) {
    return `${siteUrl.slice(0, -1)}${path}`;
  }
  return `${siteUrl}${path}`;
};

const getLastUpdatedEducation = async () => {
  const educations = await db.education.findMany({ orderBy: { updatedAt: 'desc' } });
  if (educations.length > 0) {
    return educations[0].updatedAt;
  }
  return new Date();
};

const getLastUpdatedExperience = async () => {
  const educations = await db.experience.findMany({ orderBy: { updatedAt: 'desc' } });
  if (educations.length > 0) {
    return educations[0].updatedAt;
  }
  return new Date();
};

/**
 * Returns the sitemap entries that are not derived from the set of projects.
 *
 * The last-modified values are not truly indicative of when a page last changed, because
 * relational models can change without the core model refreshing its own last-modified date. This
 * approximation suffices for the sitemap's purposes.
 */
const getBaseUrls = async () =>
  [
    {
      changeFrequency: 'monthly',
      lastModified: new Date(),
      priority: 1,
      url: toSiteUrl(),
    },
    {
      changeFrequency: 'weekly',
      lastModified: new Date(),
      priority: 1,
      url: toSiteUrl('/dashboard'),
    },
    {
      changeFrequency: 'monthly',
      lastModified: await getLastUpdatedExperience(),
      priority: 1,
      url: toSiteUrl('/resume/experience'),
    },
    {
      changeFrequency: 'monthly',
      lastModified: await getLastUpdatedEducation(),
      priority: 1,
      url: toSiteUrl('/resume/education'),
    },
  ] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrls = await getBaseUrls();
  const projects = await db.project.findMany({ orderBy: { updatedAt: 'desc' } });
  return [
    ...baseUrls,
    ...projects.map(({ slug, updatedAt }) => ({
      changeFrequency: 'monthly' as const,
      lastModified: updatedAt,
      priority: 0.8,
      url: toSiteUrl(`/projects/${slug}`),
    })),
  ];
}
