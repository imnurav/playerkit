export const playerStyles = `
.vhp-player {
  position: relative;
  overflow: hidden;
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
  cursor: default;
}

.vhp-buffering {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.vhp-buffering span {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 3px solid rgb(248 250 252 / 0.28);
  border-block-start-color: var(--vhp-accent);
  animation: vhp-spin 0.8s linear infinite;
}

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

.vhp-controls {
  position: absolute;
  inset-inline: 14px;
  inset-block-end: 14px;
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
  height: 22px;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.vhp-progress input::-webkit-slider-runnable-track {
  height: 4px;
  background: transparent;
}

.vhp-progress input::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  margin-top: -5px;
  appearance: none;
  border: 2px solid #082f49;
  border-radius: 999px;
  background: var(--vhp-accent);
  box-shadow: 0 0 0 3px rgb(56 189 248 / 0.18);
}

.vhp-progress input::-moz-range-track {
  height: 4px;
  background: transparent;
}

.vhp-progress input::-moz-range-progress {
  background: transparent;
}

.vhp-progress input::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid #082f49;
  border-radius: 999px;
  background: var(--vhp-accent);
  box-shadow: 0 0 0 3px rgb(56 189 248 / 0.18);
}

.vhp-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

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

.vhp-time {
  min-width: 112px;
  color: var(--vhp-muted);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.vhp-loaded {
  min-width: 74px;
  color: rgb(203 213 225 / 0.82);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.vhp-spacer {
  flex: 1 1 auto;
}

.vhp-volume {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 112px;
}

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

@media (max-width: 760px) {
  .vhp-player {
    min-height: 240px;
  }
  
  .vhp-controls {
    inset-inline: 8px;
    inset-block-end: 8px;
    padding: 10px;
  }

  .vhp-control-row {
    display: grid;
    grid-template-columns: auto auto auto minmax(0, 1fr) auto;
  }

  .vhp-time {
    min-width: 0;
    font-size: 12px;
  }

  .vhp-loaded {
    display: none;
  }

  .vhp-volume {
    display: none;
  }

  .vhp-select-label span {
    display: none;
  }

  .vhp-select-label {
    min-width: 0;
  }

  .vhp-select-label select {
    width: 92px;
    max-width: 92px;
    font-size: 12px;
  }

  .vhp-seek-feedback-left {
    left: 12%;
  }

  .vhp-seek-feedback-right {
    right: 12%;
  }
}

@media (max-width: 520px) {
  .vhp-control-row {
    grid-template-columns: auto auto auto minmax(72px, 1fr) auto;
    gap: 6px;
  }

  .vhp-icon-button {
    width: 34px;
    height: 34px;
  }

  .vhp-icon-button svg {
    width: 19px;
    height: 19px;
  }

  .vhp-select-label:nth-of-type(1) {
    display: none;
  }
}

@keyframes vhp-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes vhp-feedback {
  0% {
    opacity: 0;
    transform: translateY(-50%) scale(0.86);
  }
  20% {
    opacity: 1;
    transform: translateY(-50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50%) scale(1.08);
  }
}

/* ===== Platform-Specific Control Layouts ===== */

/* Shared control group layout */
.vhp-control-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.vhp-control-group-left {
  flex: 1 1 auto;
  min-width: 0;
}

.vhp-control-group-right {
  flex: 0 0 auto;
}

/* ===== YouTube Controls ===== */
.vhp-controls-youtube {
  background: linear-gradient(180deg, rgb(15 15 15 / 0.16), rgb(15 15 15 / 0.9));
  border: none;
  border-radius: 0;
  inset-inline: 0;
  inset-block-end: 0;
  backdrop-filter: none;
  padding: 0 12px 6px;
}

.vhp-controls-youtube .vhp-icon-button {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: background 150ms ease;
}

.vhp-controls-youtube .vhp-icon-button:hover {
  background: rgb(255 255 255 / 0.1);
}

.vhp-controls-youtube .vhp-progress {
  height: 30px;
  cursor: pointer;
}

.vhp-controls-youtube .vhp-progress input {
  height: 30px;
}

.vhp-controls-youtube .vhp-progress-track {
  height: 3px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.2);
}

.vhp-controls-youtube .vhp-progress-played {
  background: var(--vhp-accent, #ff0033);
}

.vhp-controls-youtube .vhp-control-row {
  gap: -4px;
}

.vhp-controls-youtube .vhp-time {
  font-size: 13px;
  color: rgb(255 255 255 / 0.8);
}

.vhp-controls-youtube .vhp-volume input {
  width: 52px;
  accent-color: #fff;
}

.vhp-controls-youtube .vhp-settings-menu {
  bottom: calc(100% + 8px);
  background: rgb(35 35 35 / 0.95);
  border-color: rgb(255 255 255 / 0.08);
  border-radius: 12px;
  backdrop-filter: blur(12px);
}

.vhp-controls-youtube .vhp-select-label {
  color: rgb(255 255 255 / 0.7);
}

/* ===== Netflix Controls ===== */
.vhp-controls-netflix {
  background: transparent;
  border: none;
  backdrop-filter: none;
  inset-inline: 0;
  inset-block-end: 0;
  padding: 0 24px 12px;
  gap: 4px;
}

.vhp-controls-netflix .vhp-progress {
  height: 24px;
  cursor: pointer;
}

.vhp-controls-netflix .vhp-progress-track {
  height: 3px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.2);
}

.vhp-controls-netflix .vhp-progress-played {
  background: var(--vhp-accent, #e50914);
}

.vhp-controls-netflix .vhp-progress input {
  height: 24px;
}

.vhp-controls-netflix .vhp-icon-button {
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  transition: transform 120ms ease;
}

.vhp-controls-netflix .vhp-icon-button:hover {
  transform: scale(1.12);
}

.vhp-controls-netflix .vhp-icon-button svg {
  width: 24px;
  height: 24px;
}

.vhp-controls-netflix .vhp-time {
  font-size: 14px;
  font-weight: 500;
  color: rgb(255 255 255 / 0.85);
}

.vhp-controls-netflix .vhp-settings-menu {
  bottom: calc(100% + 8px);
  background: rgb(20 20 20 / 0.96);
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 4px;
  min-width: 200px;
  padding: 8px 0;
  backdrop-filter: blur(12px);
}

.vhp-settings-content-netflix {
  display: grid;
  gap: 6px;
}

.vhp-settings-section {
  padding: 8px 16px;
  display: grid;
  gap: 6px;
}

.vhp-settings-section:hover {
  background: rgb(255 255 255 / 0.06);
}

.vhp-settings-title {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgb(255 255 255 / 0.5);
}

.vhp-settings-section select {
  width: 100%;
  height: 36px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 2px;
  color: #fff;
  background: rgb(255 255 255 / 0.06);
  padding: 0 8px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

/* ===== Hotstar Controls ===== */
.vhp-controls-hotstar {
  background: linear-gradient(180deg, rgb(8 19 43 / 0.72), rgb(8 19 43 / 0.9));
  border: 1px solid rgb(96 165 250 / 0.18);
  border-radius: 10px;
  inset-inline: 18px;
  inset-block-end: 18px;
  padding: 10px 14px;
}

.vhp-controls-hotstar .vhp-icon-button {
  background: rgb(255 255 255 / 0.08);
  border: 1px solid rgb(255 255 255 / 0.06);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  transition: background 150ms ease, border-color 150ms ease;
}

.vhp-controls-hotstar .vhp-icon-button:hover {
  background: rgb(255 255 255 / 0.16);
  border-color: rgb(96 165 250 / 0.4);
}

.vhp-controls-hotstar .vhp-main-action {
  background: var(--vhp-accent, #1f80e0);
  border-color: transparent;
}

.vhp-controls-hotstar .vhp-main-action:hover {
  background: var(--vhp-accent, #1f80e0);
  filter: brightness(1.15);
}

.vhp-controls-hotstar .vhp-progress-track {
  height: 3px;
  border-radius: 2px;
}

.vhp-controls-hotstar .vhp-progress-played {
  background: var(--vhp-accent, #1f80e0);
}

.vhp-controls-hotstar .vhp-time {
  font-size: 12px;
  color: rgb(200 215 235 / 0.85);
}

.vhp-controls-hotstar .vhp-volume input {
  accent-color: #1f80e0;
}

.vhp-controls-hotstar .vhp-settings-menu {
  bottom: calc(100% + 8px);
  border: 1px solid rgb(96 165 250 / 0.2);
  background: rgb(8 19 43 / 0.96);
  border-radius: 10px;
  backdrop-filter: blur(12px);
}

/* ===== Amazon Prime Controls ===== */
.vhp-controls-prime {
  background: rgb(0 22 40 / 0.74);
  border: none;
  border-radius: 6px;
  box-shadow: 0 20px 52px rgb(0 168 225 / 0.12);
  inset-inline: 18px;
  inset-block-end: 18px;
  padding: 12px 16px;
}

.vhp-controls-prime .vhp-icon-button {
  background: rgb(255 255 255 / 0.06);
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 6px;
  width: 38px;
  height: 38px;
  transition: background 150ms ease, box-shadow 150ms ease;
}

.vhp-controls-prime .vhp-icon-button:hover {
  background: rgb(255 255 255 / 0.12);
  box-shadow: 0 0 12px rgb(0 168 225 / 0.2);
}

.vhp-controls-prime .vhp-main-action {
  background: var(--vhp-accent, #00a8e1);
  border-color: transparent;
  color: #001018;
}

.vhp-controls-prime .vhp-main-action:hover {
  background: var(--vhp-accent, #00a8e1);
  box-shadow: 0 0 16px rgb(0 168 225 / 0.35);
}

.vhp-controls-prime .vhp-progress-track {
  height: 3px;
  border-radius: 2px;
  background: rgb(255 255 255 / 0.15);
}

.vhp-controls-prime .vhp-progress-played {
  background: var(--vhp-accent, #00a8e1);
}

.vhp-controls-prime .vhp-progress-loaded {
  background: rgb(255 255 255 / 0.25);
}

.vhp-controls-prime .vhp-time {
  font-size: 13px;
  font-weight: 400;
  color: rgb(200 215 235 / 0.85);
}

.vhp-controls-prime .vhp-loaded {
  font-size: 11px;
  color: rgb(0 168 225 / 0.7);
}

.vhp-controls-prime .vhp-volume input {
  accent-color: #00a8e1;
}

.vhp-controls-prime .vhp-settings-menu {
  bottom: calc(100% + 8px);
  border: 1px solid rgb(0 168 225 / 0.2);
  background: rgb(0 22 40 / 0.96);
  border-radius: 6px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.4);
}

.vhp-controls-prime .vhp-select-label {
  color: rgb(200 215 235 / 0.8);
}

.vhp-controls-prime .vhp-select-label select {
  border-color: rgb(0 168 225 / 0.15);
  background: rgb(0 22 40 / 0.86);
}

/* ===== Mobile Responsive for Platform Controls ===== */
@media (max-width: 760px) {
  .vhp-controls-youtube {
    padding: 0 8px 30px;
  }

  .vhp-controls-youtube .vhp-progress {
    height: 32px;
  }

  .vhp-controls-youtube .vhp-time {
    font-size: 11px;
  }

  .vhp-controls-netflix {
    padding: 0 12px 10px;
  }

  .vhp-controls-netflix .vhp-icon-button {
    width: 34px;
    height: 34px;
  }

  .vhp-controls-netflix .vhp-icon-button svg {
    width: 20px;
    height: 20px;
  }

  .vhp-controls-netflix .vhp-time {
    font-size: 12px;
  }

  .vhp-controls-hotstar {
    inset-inline: 10px;
    inset-block-end: 10px;
    padding: 8px 10px;
  }

  .vhp-controls-hotstar .vhp-icon-button {
    width: 32px;
    height: 32px;
  }

  .vhp-controls-hotstar .vhp-icon-button svg {
    width: 18px;
    height: 18px;
  }

  .vhp-controls-prime {
    inset-inline: 10px;
    inset-block-end: 10px;
    padding: 8px 12px;
  }

  .vhp-controls-prime .vhp-icon-button {
    width: 34px;
    height: 34px;
  }

  .vhp-controls-prime .vhp-icon-button svg {
    width: 19px;
    height: 19px;
  }
}

@media (max-width: 520px) {
  .vhp-controls-youtube {
    padding: 0 6px 24px;
  }

  .vhp-controls-hotstar .vhp-icon-button,
  .vhp-controls-prime .vhp-icon-button,
  .vhp-controls-netflix .vhp-icon-button {
    width: 30px;
    height: 30px;
  }

  .vhp-controls-netflix .vhp-time {
    font-size: 10px;
  }
}
`;
