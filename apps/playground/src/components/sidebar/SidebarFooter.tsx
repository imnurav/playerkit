import React from "react";

interface SidebarFooterProps {
  handleReset: () => void;
  onOpenDocs?: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = React.memo(
  (props) => {
    const { handleReset, onOpenDocs } = props;
    return (
      <div className="pg-sidebar-footer">
        {onOpenDocs && (
          <button type="button" className="pg-docs-btn" onClick={onOpenDocs}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            View Documentation
          </button>
        )}
        <button type="button" onClick={handleReset} className="pg-reset-btn">
          Reset All Customizations
        </button>
        <div className="pg-version-chip">v2.0.0 (Active)</div>
      </div>
    );
  },
);

SidebarFooter.displayName = "SidebarFooter";
