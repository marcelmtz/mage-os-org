import { z, defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const authorCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/authors' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
    website: z.string().url().optional(),
    social: z
      .object({
        github: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        discord: z.string().optional(),
      })
      .optional(),
  }),
});

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.coerce.date().optional(),
    updateDate: z.coerce.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const eventCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/events' }),
  schema: z.object({
    title: z.string(),
    eventDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    venue: z.string().optional(),
    url: z.string().url().optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    draft: z.boolean().optional(),
  }),
});

const securityAdvisoryCollection = defineCollection({
  loader: file('src/data/security-advisories.json', {
    parser: (text) => JSON.parse(text).map((advisory: { version: string }) => ({ id: advisory.version, ...advisory })),
  }),
  schema: z.object({
    version: z.string(),
    date: z.string().date(),
    severity: z.enum(['critical', 'high', 'moderate', 'low']),
    summary: z.string(),
    cves: z.array(z.string().regex(/^CVE-\d{4}-\d+$/)),
    bulletins: z.array(z.object({ label: z.string(), url: z.string().url() })),
    post: reference('post'),
  }),
});

export const collections = {
  authors: authorCollection,
  post: postCollection,
  event: eventCollection,
  securityAdvisory: securityAdvisoryCollection,
};
