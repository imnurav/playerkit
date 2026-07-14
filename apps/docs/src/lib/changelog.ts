import { changelogDocs, changelogMeta } from '../../.source/server';
import { loader } from 'fumadocs-core/source';
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server';

export const source = loader({
  baseUrl: '/changelog',
  source: toFumadocsSource(changelogDocs, changelogMeta),
});
