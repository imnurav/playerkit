// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
var { docs, meta } = defineDocs({
  dir: "content/docs"
});
var { docs: changelogDocs, meta: changelogMeta } = defineDocs({
  dir: "content/changelog"
});
var source_config_default = defineConfig();
export {
  changelogDocs,
  changelogMeta,
  source_config_default as default,
  docs,
  meta
};
