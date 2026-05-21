export const hotstarStyles = `
/* ===== Hotstar Controls ===== */
.vhp-controls-hotstar { background: linear-gradient(180deg, rgb(8 19 43 / 0.72), rgb(8 19 43 / 0.9)); border: 1px solid rgb(96 165 250 / 0.18); border-radius: 10px; inset-inline: 18px; inset-block-end: 18px; padding: 10px 14px; }
.vhp-controls-hotstar .vhp-icon-button { background: rgb(255 255 255 / 0.08); border: 1px solid rgb(255 255 255 / 0.06); border-radius: 8px; width: 36px; height: 36px; transition: background 150ms ease, border-color 150ms ease; }
.vhp-controls-hotstar .vhp-icon-button:hover { background: rgb(255 255 255 / 0.16); border-color: rgb(96 165 250 / 0.4); }
.vhp-controls-hotstar .vhp-main-action { background: var(--vhp-accent, #1f80e0); border-color: transparent; }
.vhp-controls-hotstar .vhp-main-action:hover { filter: brightness(1.15); }
.vhp-controls-hotstar .vhp-progress-track { height: 3px; border-radius: 2px; }
.vhp-controls-hotstar .vhp-progress-played { background: var(--vhp-accent, #1f80e0); }
.vhp-controls-hotstar .vhp-time { font-size: 12px; color: rgb(200 215 235 / 0.85); }
.vhp-controls-hotstar .vhp-volume input { accent-color: #1f80e0; }

.vhp-settings-panel-hotstar { background: rgb(8 19 43 / 0.97); border: 1px solid rgb(96 165 250 / 0.2); }
.vhp-settings-sheet-hotstar { background: rgb(8 19 43 / 0.98); }

@media (max-width: 760px) {
  .vhp-controls-hotstar { inset-inline: 6px; inset-block-end: 6px; padding: 6px 8px; }
  .vhp-controls-hotstar .vhp-icon-button { width: 28px; height: 28px; }
  .vhp-controls-hotstar .vhp-icon-button svg { width: 16px; height: 16px; }
  .vhp-controls-hotstar .vhp-time { font-size: 10px; }
}
`;
