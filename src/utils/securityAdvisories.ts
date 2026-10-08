import { getCollection, type CollectionEntry } from 'astro:content';
import { fetchPosts } from '~/utils/blog';
import { getPermalink } from '~/utils/permalinks';

type AdvisoryData = CollectionEntry<'securityAdvisory'>['data'];

export type AdvisorySeverity = AdvisoryData['severity'];

export interface SecurityAdvisory extends Omit<AdvisoryData, 'post'> {
  post: string;
}

const NVD_BASE_URL = 'https://nvd.nist.gov/vuln/detail/';

export const getSecurityAdvisories = async (): Promise<SecurityAdvisory[]> => {
  const [entries, posts] = await Promise.all([getCollection('securityAdvisory'), fetchPosts()]);

  return entries
    .map(({ data }) => {
      const post = posts.find((p) => p.id === data.post.id);
      if (!post) {
        throw new Error(`Security advisory ${data.version} references unpublished post "${data.post.id}"`);
      }
      return { ...data, post: getPermalink(post.permalink, 'post') };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
};

export const getCveUrl = (cve: string): string => `${NVD_BASE_URL}${cve}`;
