import { StandalonePlayer } from "./components/StandalonePlayer.tsx";
import { DocsPage } from "./docs/DocsPage.tsx";
import { useState, useEffect } from "react";
import { App } from "./App.tsx";

export function Root() {
  const getRouteInfo = () => {
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    // Route to standalone player if path is /player or hash starts with #/player
    if (
      pathname === "/player" ||
      pathname === "/player.html" ||
      hash.startsWith("#/player")
    ) {
      return { route: "player" as const, version: "" };
    }

    if (!hash.startsWith("#/docs")) {
      return { route: "playground" as const, version: "" };
    }
    const parts = hash.split("/");
    const version = parts[2] ? parts[2].trim() : "";
    return {
      route: "docs" as const,
      version: version || "v0.0.2", // Default to v0.0.2
    };
  };

  const [routeInfo, setRouteInfo] = useState(getRouteInfo);

  useEffect(() => {
    const onHashChange = () => setRouteInfo(getRouteInfo());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const goToDocs = () => {
    window.location.hash = "#/docs/v0.0.2";
  };

  const goToPlayground = () => {
    window.location.hash = "#/";
  };

  if (routeInfo.route === "player") {
    return <StandalonePlayer />;
  }

  if (routeInfo.route === "docs") {
    return <DocsPage onBack={goToPlayground} version={routeInfo.version} />;
  }

  return <App onOpenDocs={goToDocs} />;
}
