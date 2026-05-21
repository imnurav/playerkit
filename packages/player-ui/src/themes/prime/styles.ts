export const primeStyles = `
/* ===== Prime Controls ===== */
.vhp-controls-prime { background: rgb(0 22 40 / 0.74); border: none; border-radius: 6px; box-shadow: 0 20px 52px rgb(0 168 225 / 0.12); inset-inline: 18px; inset-block-end: 18px; padding: 12px 16px; }
.vhp-controls-prime .vhp-icon-button { background: rgb(255 255 255 / 0.06); border: 1px solid rgb(255 255 255 / 0.08); border-radius: 6px; width: 38px; height: 38px; transition: background 150ms ease, box-shadow 150ms ease; }
.vhp-controls-prime .vhp-icon-button:hover { background: rgb(255 255 255 / 0.12); box-shadow: 0 0 12px rgb(0 168 225 / 0.2); }
.vhp-controls-prime .vhp-main-action { background: var(--vhp-accent, #00a8e1); border-color: transparent; color: #001018; }
.vhp-controls-prime .vhp-main-action:hover { box-shadow: 0 0 16px rgb(0 168 225 / 0.35); }
.vhp-controls-prime .vhp-progress-track { height: 3px; border-radius: 2px; background: rgb(255 255 255 / 0.15); }
.vhp-controls-prime .vhp-progress-played { background: var(--vhp-accent, #00a8e1); }
.vhp-controls-prime .vhp-progress-loaded { background: rgb(255 255 255 / 0.25); }
.vhp-controls-prime .vhp-time { font-size: 13px; font-weight: 400; color: rgb(200 215 235 / 0.85); }
.vhp-controls-prime .vhp-loaded { font-size: 11px; color: rgb(0 168 225 / 0.7); }
.vhp-controls-prime .vhp-volume input { accent-color: #00a8e1; }

.vhp-settings-panel-prime { background: rgb(0 22 40 / 0.97); border: 1px solid rgb(0 168 225 / 0.15); box-shadow: 0 24px 64px rgb(0 168 225 / 0.1); }
.vhp-settings-sheet-prime { background: rgb(0 22 40 / 0.98); }

@media (max-width: 760px) {
  .vhp-controls-prime { inset-inline: 6px; inset-block-end: 6px; padding: 6px 8px; }
  .vhp-controls-prime .vhp-icon-button { width: 28px; height: 28px; }
  .vhp-controls-prime .vhp-icon-button svg { width: 16px; height: 16px; }
  .vhp-controls-prime .vhp-time { font-size: 10px; }
}
`;
