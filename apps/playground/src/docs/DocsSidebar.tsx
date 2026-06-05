import React, { useState, useRef, useEffect } from "react";
import type { DocPackage } from "./content";
import { DOCS_VERSION } from "./content";
import { IconChevron, IconCheck } from "../icons/index";

interface DocsSidebarProps {
  packages: DocPackage[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
}

const PACKAGE_TITLES: Record<string, string> = {
  react: "React Component",
  core: "Core Playback Engine",
  ui: "UI Design System",
};

const PACKAGE_BADGES: Record<string, string> = {
  react: "React",
  core: "Core",
  ui: "UI Theme",
};

// Dynamically compute the version list. Filters out the latest version from historical lists if it overlaps.
const LATEST_V = `v${DOCS_VERSION} (Latest)`;
const HISTORICAL_VERSIONS: string[] = [];
const VERSIONS = [
  LATEST_V,
  ...HISTORICAL_VERSIONS.filter((v) => v !== `v${DOCS_VERSION}`),
];

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  packages,
  activeSection,
  onSectionClick,
  isOpen,
  onClose,
  selectedVersion,
  setSelectedVersion,
}) => {
  const [prevPackages, setPrevPackages] = useState(packages);
  const [openPkgs, setOpenPkgs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const pkg of packages) init[pkg.id] = true;
    return init;
  });

  // Adjust state during render when packages dataset changes (e.g. on version shift)
  if (packages !== prevPackages) {
    setPrevPackages(packages);
    const init: Record<string, boolean> = {};
    for (const pkg of packages) init[pkg.id] = true;
    setOpenPkgs(init);
  }

  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setVersionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePkg = (id: string) => {
    setOpenPkgs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="docs-sidebar-backdrop" onClick={onClose} />}

      <aside className={`docs-sidebar ${isOpen ? "is-open" : ""}`}>
        {/* Premium Version dropdown */}
        <div className="docs-version-selector-container" ref={dropdownRef}>
          <div className="docs-version-label">Documentation Version</div>
          <button
            type="button"
            className={`docs-version-dropdown-trigger ${versionDropdownOpen ? "is-active" : ""}`}
            onClick={() => setVersionDropdownOpen((prev) => !prev)}
            aria-expanded={versionDropdownOpen}
            aria-haspopup="listbox"
          >
            <div className="docs-version-current">
              <span className="docs-version-dot" />
              {selectedVersion}
            </div>
            <IconChevron
              className={`docs-version-chevron ${versionDropdownOpen ? "is-open" : ""}`}
              width={14}
              height={14}
            />
          </button>

          {versionDropdownOpen && (
            <div className="docs-version-dropdown-list" role="listbox">
              {VERSIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  role="option"
                  aria-selected={v === selectedVersion}
                  className={`docs-version-dropdown-item ${v === selectedVersion ? "is-active" : ""}`}
                  onClick={() => {
                    setSelectedVersion(v);
                    setVersionDropdownOpen(false);
                  }}
                >
                  {v}
                  {v === selectedVersion && (
                    <IconCheck className="docs-version-check" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="docs-sidebar-divider" />

        {/* Sidebar Nav Sections */}
        <div className="docs-sidebar-scroll-area">
          {packages.map((pkg) => {
            const isPkgOpen = openPkgs[pkg.id] ?? true;
            const displayTitle = PACKAGE_TITLES[pkg.id] ?? pkg.package;
            const displayBadge = PACKAGE_BADGES[pkg.id] ?? pkg.badge;

            return (
              <div key={pkg.id} className="docs-sidebar-section">
                <button
                  type="button"
                  className="docs-sidebar-pkg"
                  onClick={() => togglePkg(pkg.id)}
                >
                  <div className="docs-sidebar-pkg-info">
                    <span className="docs-sidebar-pkg-title">
                      {displayTitle}
                    </span>
                    <span className="docs-sidebar-pkg-sub">
                      @playerkit/{pkg.id}
                    </span>
                  </div>
                  <div className="docs-sidebar-pkg-actions">
                    <span className={`docs-sidebar-pkg-badge is-${pkg.id}`}>
                      {displayBadge}
                    </span>
                    <IconChevron
                      className={`docs-sidebar-chevron ${isPkgOpen ? "is-open" : ""}`}
                      width={12}
                      height={12}
                    />
                  </div>
                </button>

                <div
                  className={`docs-sidebar-links ${isPkgOpen ? "is-open" : ""}`}
                >
                  {pkg.sections.map((section) => {
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        className={`docs-sidebar-link ${isActive ? "is-active" : ""}`}
                        onClick={() => handleSectionClick(section.id)}
                      >
                        {isActive && <span className="docs-sidebar-link-dot" />}
                        {section.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
