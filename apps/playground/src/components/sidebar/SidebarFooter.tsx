import React from "react";
import { IconBook } from "../../icons/index";

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
            <IconBook />
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
