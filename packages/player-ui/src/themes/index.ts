import { registerTheme } from "./registry";
import { DefaultControls } from "./default/controls";
import { YouTubeControls } from "./youtube/controls";
import { NetflixControls } from "./netflix/controls";
import { HotstarControls } from "./hotstar/controls";
import { PrimeControls } from "./prime/controls";
import { youtubeStyles } from "./youtube/styles";
import { netflixStyles } from "./netflix/styles";
import { hotstarStyles } from "./hotstar/styles";
import { primeStyles } from "./prime/styles";

// Auto-register all built-in themes
registerTheme({
  name: "default",
  ControlComponent: DefaultControls,
});

registerTheme({
  name: "youtube",
  ControlComponent: YouTubeControls,
  styles: youtubeStyles,
});

registerTheme({
  name: "netflix",
  ControlComponent: NetflixControls,
  styles: netflixStyles,
});

registerTheme({
  name: "hotstar",
  ControlComponent: HotstarControls,
  styles: hotstarStyles,
});

registerTheme({
  name: "prime",
  ControlComponent: PrimeControls,
  styles: primeStyles,
});

export { registerTheme, getTheme, getAllThemeStyles } from "./registry";
export type { ThemeDefinition, ThemeControlProps } from "./registry";
