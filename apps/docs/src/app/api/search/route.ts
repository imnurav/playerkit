import { source as docsSource } from '@/lib/source';
import { source as changelogSource } from '@/lib/changelog';
import { createSearchAPI } from 'fumadocs-core/search/server';

export const { GET } = createSearchAPI('advanced', {
  indexes: [
    ...docsSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
    ...changelogSource.getPages().map((page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      id: page.url,
      structuredData: page.data.structuredData,
    })),
  ],
});
