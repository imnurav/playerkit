// @ts-nocheck
import { default as __fd_glob_40 } from "../content/docs/ui/meta.json?collection=meta"
import { default as __fd_glob_39 } from "../content/docs/guides/meta.json?collection=meta"
import { default as __fd_glob_38 } from "../content/docs/reference/meta.json?collection=meta"
import { default as __fd_glob_37 } from "../content/docs/react/meta.json?collection=meta"
import { default as __fd_glob_36 } from "../content/docs/getting-started/meta.json?collection=meta"
import { default as __fd_glob_35 } from "../content/docs/core/meta.json?collection=meta"
import { default as __fd_glob_34 } from "../content/docs/meta.json?collection=meta"
import * as __fd_glob_33 from "../content/docs/ui/themes.mdx?collection=docs"
import * as __fd_glob_32 from "../content/docs/ui/player-controls.mdx?collection=docs"
import * as __fd_glob_31 from "../content/docs/ui/overview.mdx?collection=docs"
import * as __fd_glob_30 from "../content/docs/ui/icons.mdx?collection=docs"
import * as __fd_glob_29 from "../content/docs/ui/components.mdx?collection=docs"
import * as __fd_glob_28 from "../content/docs/reference/types.mdx?collection=docs"
import * as __fd_glob_27 from "../content/docs/reference/props.mdx?collection=docs"
import * as __fd_glob_26 from "../content/docs/reference/player-controls.mdx?collection=docs"
import * as __fd_glob_25 from "../content/docs/reference/keyboard-shortcuts.mdx?collection=docs"
import * as __fd_glob_24 from "../content/docs/getting-started/quick-start.mdx?collection=docs"
import * as __fd_glob_23 from "../content/docs/getting-started/introduction.mdx?collection=docs"
import * as __fd_glob_22 from "../content/docs/getting-started/installation.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/guides/token-auth.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/guides/theming.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/guides/security.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/guides/live-streams.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/guides/custom-controls.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/react/youtube-player.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/react/player.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/react/overview.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/react/mp4-player.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/react/hooks.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/react/hls-player.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/core/youtube-engine.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/core/overview.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/core/mp4-engine.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/core/hls-engine.mdx?collection=docs"
import { default as __fd_glob_6 } from "../content/changelog/meta.json?collection=changelogMeta"
import * as __fd_glob_5 from "../content/changelog/v0.0.6.mdx?collection=changelogDocs"
import * as __fd_glob_4 from "../content/changelog/v0.0.5.mdx?collection=changelogDocs"
import * as __fd_glob_3 from "../content/changelog/v0.0.4.mdx?collection=changelogDocs"
import * as __fd_glob_2 from "../content/changelog/v0.0.3.mdx?collection=changelogDocs"
import * as __fd_glob_1 from "../content/changelog/v0.0.2.mdx?collection=changelogDocs"
import * as __fd_glob_0 from "../content/changelog/v0.0.1.mdx?collection=changelogDocs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const changelogDocs = await create.doc("changelogDocs", "content/changelog", {"v0.0.1.mdx": __fd_glob_0, "v0.0.2.mdx": __fd_glob_1, "v0.0.3.mdx": __fd_glob_2, "v0.0.4.mdx": __fd_glob_3, "v0.0.5.mdx": __fd_glob_4, "v0.0.6.mdx": __fd_glob_5, });

export const changelogMeta = await create.meta("changelogMeta", "content/changelog", {"meta.json": __fd_glob_6, });

export const docs = await create.doc("docs", "content/docs", {"core/hls-engine.mdx": __fd_glob_7, "core/mp4-engine.mdx": __fd_glob_8, "core/overview.mdx": __fd_glob_9, "core/youtube-engine.mdx": __fd_glob_10, "react/hls-player.mdx": __fd_glob_11, "react/hooks.mdx": __fd_glob_12, "react/mp4-player.mdx": __fd_glob_13, "react/overview.mdx": __fd_glob_14, "react/player.mdx": __fd_glob_15, "react/youtube-player.mdx": __fd_glob_16, "guides/custom-controls.mdx": __fd_glob_17, "guides/live-streams.mdx": __fd_glob_18, "guides/security.mdx": __fd_glob_19, "guides/theming.mdx": __fd_glob_20, "guides/token-auth.mdx": __fd_glob_21, "getting-started/installation.mdx": __fd_glob_22, "getting-started/introduction.mdx": __fd_glob_23, "getting-started/quick-start.mdx": __fd_glob_24, "reference/keyboard-shortcuts.mdx": __fd_glob_25, "reference/player-controls.mdx": __fd_glob_26, "reference/props.mdx": __fd_glob_27, "reference/types.mdx": __fd_glob_28, "ui/components.mdx": __fd_glob_29, "ui/icons.mdx": __fd_glob_30, "ui/overview.mdx": __fd_glob_31, "ui/player-controls.mdx": __fd_glob_32, "ui/themes.mdx": __fd_glob_33, });

export const meta = await create.meta("meta", "content/docs", {"meta.json": __fd_glob_34, "core/meta.json": __fd_glob_35, "getting-started/meta.json": __fd_glob_36, "react/meta.json": __fd_glob_37, "reference/meta.json": __fd_glob_38, "guides/meta.json": __fd_glob_39, "ui/meta.json": __fd_glob_40, });