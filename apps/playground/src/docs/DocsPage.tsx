import { DOCS_PACKAGES as DOCS_PACKAGES_V0_0_1 } from "./content_v0_0_1";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { DOCS_PACKAGES, DOCS_VERSION } from "./content";
import { DocsSidebar } from "./DocsSidebar";
import { DocsContent } from "./DocsContent";
import { DocsNavbar } from "./DocsNavbar";
import { DocsSearch } from "./DocsSearch";
import "./docs.css";

interface DocsPageProps {
  onBack: () => void;
  version: string;
}

export const DocsPage: React.FC<DocsPageProps> = ({ onBack, version }) => {
  // Normalize version input
  const normVersion = version === "latest" ? `v${DOCS_VERSION}` : version;

  // Verify if the version is supported
  const isSupported = normVersion === "v0.0.1" || normVersion === `v${DOCS_VERSION}`;

  // Pick packages
  const activePackages = normVersion === "v0.0.1" ? DOCS_PACKAGES_V0_0_1 : DOCS_PACKAGES;

  const [activeSection, setActiveSection] = useState<string>(
    activePackages[0]?.sections[0]?.id ?? "",
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [prevPackages, setPrevPackages] = useState(activePackages);

  if (activePackages !== prevPackages) {
    setPrevPackages(activePackages);
    setActiveSection(activePackages[0]?.sections[0]?.id ?? "");
  }

  // Scroll to top when switching versions
  useEffect(() => {
    const area = contentRef.current;
    if (area) {
      area.scrollTop = 0; // Scroll to top when switching versions
    }
  }, [activePackages]);

  // ── Scroll spy (IntersectionObserver) ──────────────────────────────────────
  useEffect(() => {
    if (!isSupported) return; // Disable scroll spy if version is not supported

    const area = contentRef.current;
    if (!area) return;

    const sectionEls: HTMLElement[] = [];
    for (const pkg of activePackages) {
      for (const sec of pkg.sections) {
        const el = area.querySelector<HTMLElement>(`#${sec.id}`);
        if (el) sectionEls.push(el);
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { root: area, rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );

    for (const el of sectionEls) observer.observe(el);
    return () => observer.disconnect();
  }, [activePackages, isSupported]);

  // ── Navigate to section ─────────────────────────────────────────────────────
  const navigateToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const area = contentRef.current;
    if (!area) return;
    const el = area.querySelector<HTMLElement>(`#${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // ── Global keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  // Formats version label for dropdown display
  const sidebarSelectedVersion =
    normVersion === `v${DOCS_VERSION}`
      ? `${normVersion} (Latest)`
      : normVersion;

  return (
    <div className="docs-root">
      <DocsNavbar
        onSearchOpen={() => setSearchOpen(true)}
        onMobileNavToggle={() => setMobileNavOpen((p) => !p)}
        isMobileNavOpen={mobileNavOpen}
        onBackToPlayground={onBack}
      />

      <div className="docs-body">
        <DocsSidebar
          packages={activePackages}
          activeSection={isSupported ? activeSection : ""}
          onSectionClick={navigateToSection}
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          selectedVersion={sidebarSelectedVersion}
          setSelectedVersion={(v) => {
            const cleanV = v.replace(" (Latest)", "");
            window.location.hash = `#/docs/${cleanV}`;
          }}
        />

        <DocsContent
          packages={activePackages}
          contentRef={contentRef}
          isSupported={isSupported}
          unsupportedVersion={version}
        />
      </div>

      <DocsSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(sectionId) => {
          navigateToSection(sectionId);
          setMobileNavOpen(false);
        }}
        packages={activePackages}
      />
    </div>
  );
};
