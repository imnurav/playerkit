export const youtubeStyles = `
/* ===== YouTube Controls ===== */
.vhp-controls-youtube {
  background: linear-gradient(180deg, rgb(15 15 15 / 0.16), rgb(15 15 15 / 0.9));
  border: none; border-radius: 0; inset-inline: 0; inset-block-end: 0; backdrop-filter: none; padding: 0 12px 6px;
}
.vhp-controls-youtube .vhp-icon-button { background: transparent; border: none; width: 36px; height: 36px; border-radius: 50%; transition: background 150ms ease; }
.vhp-controls-youtube .vhp-icon-button:hover { background: rgb(255 255 255 / 0.1); }
.vhp-controls-youtube .vhp-progress { height: 30px; cursor: pointer; }
.vhp-controls-youtube .vhp-progress input { height: 30px; }
.vhp-controls-youtube .vhp-progress-track { height: 3px; border-radius: 2px; background: rgb(255 255 255 / 0.2); }
.vhp-controls-youtube .vhp-progress-played { background: var(--vhp-accent, #ff0033); }
.vhp-controls-youtube .vhp-control-row { gap: -4px; }
.vhp-controls-youtube .vhp-time { font-size: 13px; color: rgb(255 255 255 / 0.8); }
.vhp-controls-youtube .vhp-volume input { width: 52px; accent-color: #fff; }

.vhp-settings-dropdown-youtube { background: rgb(35 35 35 / 0.98); border-radius: 12px; }
.vhp-settings-sheet-youtube { background: rgb(40 40 40 / 0.98); }

@media (max-width: 760px) {
  .vhp-controls-youtube { padding: 0 6px 24px; gap: 2px; }
  .vhp-controls-youtube .vhp-progress { height: 24px; }
  .vhp-controls-youtube .vhp-icon-button { width: 28px; height: 28px; }
  .vhp-controls-youtube .vhp-icon-button svg { width: 16px; height: 16px; }
  .vhp-controls-youtube .vhp-time { font-size: 10px; }
}

@media (max-width: 520px) {
  .vhp-controls-youtube { padding: 0 4px 18px; }
  .vhp-controls-youtube .vhp-icon-button { width: 24px; height: 24px; }
  .vhp-controls-youtube .vhp-icon-button svg { width: 14px; height: 14px; }
}
`;
