export const netflixStyles = `
/* ===== Netflix Controls ===== */
.vhp-controls-netflix { background: transparent; border: none; backdrop-filter: none; inset-inline: 0; inset-block-end: 0; padding: 0 24px 12px; gap: 4px; }
.vhp-controls-netflix .vhp-progress { height: 24px; cursor: pointer; }
.vhp-controls-netflix .vhp-progress-track { height: 3px; border-radius: 2px; background: rgb(255 255 255 / 0.2); }
.vhp-controls-netflix .vhp-progress-played { background: var(--vhp-accent, #e50914);}
.vhp-controls-netflix .vhp-progress input { height: 24px; }
.vhp-controls-netflix .vhp-icon-button { background: transparent; border: none; width: 40px; height: 40px; border-radius: 4px; transition: transform 120ms ease; }
.vhp-controls-netflix .vhp-icon-button:hover { transform: scale(1.12); }
.vhp-controls-netflix .vhp-icon-button svg { width: 24px; height: 24px; }
.vhp-controls-netflix .vhp-time { font-size: 14px; font-weight: 500; color: rgb(255 255 255 / 0.85); }

.vhp-settings-dropdown-netflix { background: rgb(20 20 20 / 0.98); border-radius: 4px; }
.vhp-settings-sheet-netflix { background: rgb(20 20 20 / 0.98); }

@media (max-width: 760px) {
  .vhp-controls-netflix { padding: 0 10px 8px; gap: 2px; }
  .vhp-controls-netflix .vhp-progress { height: 20px; }
  .vhp-controls-netflix .vhp-icon-button { width: 28px; height: 28px; }
  .vhp-controls-netflix .vhp-icon-button svg { width: 16px; height: 16px; }
  .vhp-controls-netflix .vhp-time { font-size: 10px; }
}

@media (max-width: 520px) {
  .vhp-controls-netflix .vhp-icon-button { width: 24px; height: 24px; }
  .vhp-controls-netflix .vhp-icon-button svg { width: 14px; height: 14px; }
}
`;
