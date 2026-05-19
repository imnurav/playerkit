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

.vhp-controls-youtube {
  inset-inline: 0;
  inset-block-end: 0;
  border-inline: 0;
  border-block-end: 0;
  border-radius: 0;
  background: linear-gradient(180deg, rgb(15 15 15 / 0.16), rgb(15 15 15 / 0.9));
  border-color: transparent;
}

.vhp-controls-youtube .vhp-icon-button {
  background: transparent;
}

.vhp-controls-netflix {
  inset-inline: 22px;
  inset-block-end: 20px;
  border-color: transparent;
  background: transparent;
  backdrop-filter: none;
}

.vhp-controls-netflix .vhp-progress {
  order: -1;
}

.vhp-controls-netflix .vhp-icon-button {
  background: rgb(0 0 0 / 0.32);
}

.vhp-controls-hotstar {
  inset-inline: 18px;
  inset-block-end: 18px;
  border-color: rgb(96 165 250 / 0.18);
  background: linear-gradient(180deg, rgb(8 19 43 / 0.72), rgb(8 19 43 / 0.9));
}

.vhp-controls-prime {
  inset-inline: 18px;
  inset-block-end: 18px;
  background: rgb(0 22 40 / 0.74);
  box-shadow: 0 20px 52px rgb(0 168 225 / 0.12);
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
`;
