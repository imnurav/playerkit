export const basePlayerStyles = `
/* ===== Player Container ===== */
.vhp-player {
  position: relative;
  aspect-ratio: 16 / 9;
  min-height: 220px;
  color: var(--vhp-text);
  background: var(--vhp-video-bg);
  border-radius: var(--vhp-radius);
  outline: none;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.vhp-player:focus-visible {
  box-shadow: 0 0 0 3px rgb(56 189 248 / 0.45);
}

/* Inner clip wrapper — clips video & overlays, but allows settings dropdown to overflow */
.vhp-clip {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
}

.vhp-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  background: #020617;
  background: var(--vhp-video-bg);
}

.vhp-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgb(2 6 23 / 0) 42%, rgb(2 6 23 / 0.82) 100%);
  opacity: 1;
  transition: opacity 180ms ease;
}

/* ===== Tap Layer ===== */
.vhp-tap-layer {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.vhp-tap-zone {
  border: 0;
  padding: 0;
  background: transparent;
  outline: none;
}

.vhp-tap-zone:focus,
.vhp-tap-zone:focus-visible,
.vhp-tap-zone::-moz-focus-inner {
  outline: none;
  border: 0;
  box-shadow: none;
}

/* ===== Buffering ===== */
.vhp-buffering {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 3;
}

.vhp-buffering span {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 3px solid rgb(248 250 252 / 0.28);
  border-block-start-color: var(--vhp-accent);
  animation: vhp-spin 0.8s linear infinite;
}

/* ===== Seek Feedback ===== */
.vhp-seek-feedback {
  position: absolute;
  top: 50%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgb(2 6 23 / 0.72);
  border: 1px solid var(--vhp-border);
  transform: translateY(-50%);
  pointer-events: none;
  animation: vhp-feedback 520ms ease both;
}

.vhp-seek-feedback-left {
  left: 18%;
}

.vhp-seek-feedback-right {
  right: 18%;
}

.vhp-seek-feedback svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* ===== Common Control Styles ===== */
.vhp-controls {
  position: absolute;
  inset-inline: 14px;
  inset-block-end: 8px;
  display: grid;
  gap: 10px;
  padding: 12px;
  color: var(--vhp-text);
  background: var(--vhp-surface);
  border: 1px solid var(--vhp-border);
  border-radius: var(--vhp-control-radius);
  backdrop-filter: blur(18px);
  z-index: 2;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 180ms ease, transform 180ms ease;
}

.vhp-player[data-controls-visible="false"] .vhp-controls {
  opacity: 0;
  pointer-events: none;
  transform: translateY(14px);
}

.vhp-player[data-controls-visible="false"] .vhp-gradient {
  opacity: 0;
}

/* ===== Center Play Button ===== */
.vhp-center-play {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 68px;
  height: 68px;
  display: grid;
  place-items: center;
  z-index: 2;
  border: 1px solid var(--vhp-border);
  border-radius: 999px;
  color: var(--vhp-accent-contrast);
  background: var(--vhp-accent);
  box-shadow: 0 18px 42px rgb(0 0 0 / 0.36);
  transform: translate(-50%, -50%);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease;
}

.vhp-center-play svg {
  width: 32px;
  height: 32px;
  fill: currentColor;
}

.vhp-player[data-controls-visible="true"] .vhp-center-play {
  opacity: 1;
  pointer-events: auto;
}

.vhp-player[data-controls-visible="false"] .vhp-center-play {
  transform: translate(-50%, -50%) scale(0.92);
}

/* ===== Progress Bar ===== */
.vhp-progress {
  position: relative;
  display: grid;
  align-items: center;
  height: 22px;
}

.vhp-progress-track {
  position: absolute;
  inset-inline: 0;
  top: 50%;
  height: 4px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(248 250 252 / 0.18);
  transform: translateY(-50%);
  pointer-events: none;
}

.vhp-progress-loaded,
.vhp-progress-played {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  border-radius: inherit;
}

.vhp-progress-loaded {
  background: rgb(248 250 252 / 0.42);
}

.vhp-progress-played {
  background: var(--vhp-accent);
}

.vhp-progress input,
.vhp-volume input {
  width: 100%;
  margin: 0;
  accent-color: var(--vhp-accent);
}

.vhp-progress input {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 22px;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

/* Make the invisible track fill the input so the thumb auto-centers */
.vhp-progress input::-webkit-slider-runnable-track {
  height: 22px;
  background: transparent;
}

.vhp-progress input::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  margin-top: 5px;
  appearance: none;
  border-radius: 999px;
  background: var(--vhp-accent);
}

.vhp-progress input::-moz-range-track {
  height: 22px;
  background: transparent;
}

.vhp-progress input::-moz-range-progress {
  background: transparent;
}

.vhp-progress input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 999px;
  background: var(--vhp-accent);
}

/* ===== Control Row ===== */
.vhp-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* ===== Icon Button ===== */
.vhp-icon-button {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 8px;
  color: currentColor;
  background: rgb(15 23 42 / 0.5);
  cursor: pointer;
}

.vhp-icon-button:hover,
.vhp-icon-button:focus-visible,
.vhp-select-label select:hover,
.vhp-select-label select:focus-visible {
  border-color: var(--vhp-accent);
  outline: none;
}

.vhp-icon-button svg {
  width: 21px;
  height: 21px;
  fill: currentColor;
}

.vhp-main-action {
  background: var(--vhp-accent);
  color: var(--vhp-accent-contrast);
}

.vhp-spacer {
  flex: 1 1 auto;
}

/* ===== Time Display ===== */
.vhp-time {
  min-width: 112px;
  color: var(--vhp-muted);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ===== Loaded Text ===== */
.vhp-loaded {
  min-width: 74px;
  color: rgb(203 213 225 / 0.82);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ===== Volume Control ===== */
.vhp-volume {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 112px;
}

/* ===== Select Label ===== */
.vhp-select-label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--vhp-muted);
  font-size: 12px;
}

.vhp-select-label select {
  height: 36px;
  max-width: 120px;
  border: 1px solid var(--vhp-border);
  border-radius: 8px;
  color: var(--vhp-text);
  background: rgb(15 23 42 / 0.86);
  padding: 0 8px;
  font: inherit;
}

/* ===== Settings Anchor ===== */
.vhp-settings-anchor {
  position: relative;
  display: inline-flex;
}

/* ===== Settings Dropdown ===== */
.vhp-settings-dropdown {
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  min-width: 240px;
  max-height: min(320px, 40vh);
  overflow-y: auto;
  border-radius: 12px;
  background: rgb(35 35 35 / 0.96);
  border: 1px solid rgb(255 255 255 / 0.08);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.5);
  animation: vhp-scale-in 180ms ease both;
  z-index: 10;
}

/* Scrollbar styling for settings dropdown */
.vhp-settings-dropdown::-webkit-scrollbar {
  width: 4px;
}
.vhp-settings-dropdown::-webkit-scrollbar-track {
  background: transparent;
}
.vhp-settings-dropdown::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 0.15);
  border-radius: 4px;
}

/* ===== Settings Overlay ===== */
.vhp-settings-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 10;
  background: rgb(0 0 0 / 0.4);
  animation: vhp-fade-in 150ms ease both;
}

.vhp-settings-panel {
  width: min(300px, calc(100% - 32px));
  max-height: min(80%, 300px);
  overflow-y: auto;
  border-radius: 12px;
  background: rgb(15 15 15 / 0.96);
  border: 1px solid rgb(255 255 255 / 0.1);
  backdrop-filter: blur(20px);
  box-shadow: 0 24px 64px rgb(0 0 0 / 0.5);
  animation: vhp-scale-in 180ms ease both;
}

.vhp-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgb(255 255 255 / 0.06);
}

.vhp-settings-close {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.08);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}

.vhp-settings-body {
  padding: 8px 20px 16px;
  display: grid;
  gap: 12px;
}

.vhp-settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.vhp-settings-label {
  font-size: 13px;
  color: rgb(255 255 255 / 0.7);
  white-space: nowrap;
}

.vhp-settings-item select {
  height: 34px;
  min-width: 120px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 8px;
  color: #fff;
  background: rgb(255 255 255 / 0.06);
  padding: 0 8px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

/* ===== Settings Menu (Legacy inline) ===== */
.vhp-settings {
  position: relative;
  flex: 0 0 auto;
}

.vhp-settings-menu {
  position: absolute;
  right: 0;
  bottom: calc(100% + 10px);
  min-width: 172px;
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--vhp-border);
  border-radius: var(--vhp-control-radius);
  background: var(--vhp-surface);
  box-shadow: 0 18px 42px rgb(0 0 0 / 0.32);
  backdrop-filter: blur(18px);
}

.vhp-settings-menu .vhp-select-label {
  justify-content: space-between;
}

/* ===== Settings Bottom Sheet (Mobile) ===== */
.vhp-settings-backdrop {
  position: absolute;
  inset: 0;
  z-index: 9;
  background: rgb(0 0 0 / 0.5);
  animation: vhp-fade-in 200ms ease both;
}

.vhp-settings-sheet {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 10;
  max-height: min(60%, 280px);
  border-radius: 16px 16px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: vhp-slide-up 250ms ease both;
}

.vhp-settings-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1 1 auto;
  padding: 8px 0;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.vhp-settings-section {
  padding: 4px 0;
}

.vhp-settings-section-title {
  padding: 8px 20px 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgb(255 255 255 / 0.5);
}

.vhp-settings-divider {
  height: 1px;
  margin: 4px 16px;
  background: rgb(255 255 255 / 0.08);
}

.vhp-settings-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 20px;
  border: none;
  border-radius: 0;
  color: rgb(255 255 255 / 0.85);
  background: transparent;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 100ms ease;
}

.vhp-settings-option:hover {
  background: rgb(255 255 255 / 0.06);
}

.vhp-settings-option.is-active {
  color: #fff;
}

.vhp-settings-option-dot {
  width: 16px;
  font-size: 10px;
  color: rgb(255 255 255 / 0.4);
  flex-shrink: 0;
}

.vhp-settings-option.is-active .vhp-settings-option-dot {
  color: var(--vhp-accent, #38bdf8);
}

.vhp-settings-check {
  margin-inline-start: auto;
  font-size: 14px;
  color: var(--vhp-accent, #38bdf8);
}

.vhp-settings-option-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  min-width: 0;
  gap: 8px;
}

.vhp-settings-option-value {
  font-size: 12px;
  color: rgb(255 255 255 / 0.5);
  white-space: nowrap;
}

.vhp-settings-icon {
  width: 20px;
  font-size: 16px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0.6;
}

.vhp-settings-chevron {
  font-size: 14px;
  color: rgb(255 255 255 / 0.3);
  flex-shrink: 0;
}

.vhp-settings-back {
  color: rgb(255 255 255 / 0.7);
  font-weight: 500;
}

.vhp-settings-back-arrow {
  font-size: 16px;
  margin-inline-end: 4px;
}

.vhp-settings-panel::-webkit-scrollbar,
.vhp-settings-scroll::-webkit-scrollbar {
  width: 4px;
}

.vhp-settings-panel::-webkit-scrollbar-track,
.vhp-settings-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.vhp-settings-panel::-webkit-scrollbar-thumb,
.vhp-settings-scroll::-webkit-scrollbar-thumb {
  background: rgb(255 255 255 / 0.15);
  border-radius: 4px;
}

/* ===== Center Play/Pause Action Overlay (Mobile) ===== */
.vhp-center-action {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  z-index: 4;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: vhp-center-action 400ms ease both;
}

.vhp-center-action svg {
  width: 40px;
  height: 40px;
  fill: #fff;
  filter: drop-shadow(0 2px 8px rgb(0 0 0 / 0.5));
}

/* ===== Top Controls (Mobile) ===== */
.vhp-top-controls {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  display: flex;
  justify-content: flex-end;
  padding: 10px 12px;
  z-index: 5;
  pointer-events: none;
  opacity: 1;
  transition: opacity 180ms ease;
}

.vhp-player[data-controls-visible="false"] .vhp-top-controls[data-top-controls-visible="false"] {
  opacity: 0;
  pointer-events: none;
}

.vhp-top-controls-right {
  display: flex;
  gap: 8px;
  pointer-events: auto;
}

.vhp-icon-button-top {
  width: 36px;
  height: 36px;
  display: inline-grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  color: #fff;
  background: rgb(0 0 0 / 0.5);
  backdrop-filter: blur(4px);
  cursor: pointer;
}

.vhp-icon-button-top svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

/* ===== Keyframes ===== */
@keyframes vhp-spin {
  to { transform: rotate(360deg); }
}

@keyframes vhp-feedback {
  0% { opacity: 0; transform: translateY(-50%) scale(0.86); }
  20% { opacity: 1; transform: translateY(-50%) scale(1); }
  100% { opacity: 0; transform: translateY(-50%) scale(1.08); }
}

@keyframes vhp-center-action {
  0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
  30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}

@keyframes vhp-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes vhp-scale-in {
  from { opacity: 0; transform: scale(0.92) translateY(4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes vhp-slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* ===== Responsive: Mobile (≤760px) ===== */
@media (max-width: 760px) {
  .vhp-player { min-height: 240px; }
  .vhp-controls { inset-inline: 6px; inset-block-end: 4px; padding: 6px 8px; gap: 6px; }
  .vhp-controls .vhp-progress { height: 18px; }
  .vhp-controls .vhp-progress input { height: 18px; }
  .vhp-controls .vhp-progress input::-webkit-slider-runnable-track { height: 18px; }
  .vhp-controls .vhp-progress input::-webkit-slider-thumb { margin-top: 2px; }
  .vhp-controls .vhp-progress input::-moz-range-track { height: 18px; }
  .vhp-controls .vhp-progress input::-moz-range-thumb { margin-top: 2px; }
  .vhp-controls .vhp-progress-track { height: 2px; }
  .vhp-control-row { gap: 4px; }
  .vhp-icon-button { width: 30px; height: 30px; border-radius: 6px; }
  .vhp-icon-button svg { width: 17px; height: 17px; }
  .vhp-time { min-width: 0; font-size: 11px; }
  .vhp-loaded { display: none; }
  .vhp-volume { display: none; }
  .vhp-select-label span { display: none; }
  .vhp-select-label { min-width: 0; }
  .vhp-select-label select { width: 92px; max-width: 92px; font-size: 12px; }
  .vhp-seek-feedback-left { left: 12%; }
  .vhp-seek-feedback-right { right: 12%; }
  .vhp-top-controls { padding: 4px 6px; }
  .vhp-icon-button-top { width: 28px; height: 28px; }
  .vhp-icon-button-top svg { width: 16px; height: 16px; }
}

/* ===== Responsive: Small (≤520px) ===== */
@media (max-width: 520px) {
  .vhp-controls { padding: 4px 6px; gap: 4px; }
  .vhp-control-row { gap: 3px; }
  .vhp-icon-button { width: 26px; height: 26px; border-radius: 5px; }
  .vhp-icon-button svg { width: 15px; height: 15px; }
  .vhp-time { font-size: 10px; }
  .vhp-select-label:not(:only-child) { display: none; }
}
`;
