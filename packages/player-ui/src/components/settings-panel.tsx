import type { Player, PlayerSnapshot } from "@varun/player-core";
import { useEffect, useRef, useState } from "react";

type View = "main" | "speed" | "quality";

export type SettingsPanelProps = {
  playbackRates: number[];
  player: Player | null;
  state: PlayerSnapshot | null;
  onClose: () => void;
  isMobile: boolean;
  mode?: "sheet" | "dropdown";
  themeClass?: string;
  controlsVisible?: boolean;
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

/* ─── Inline SVG icons (clean, professional) ────────────────────────────────── */

function SpeedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="vp-settings-svg" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.24-12.24L11 13l-1.41-1.41a.996.996 0 1 0-1.41 1.41l2.12 2.12a.996.996 0 0 0 1.41 0l5.66-5.66a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.13-.09z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12 7v5l3.5 2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function QualityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="vp-settings-svg" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="700"
        fontFamily="system-ui"
      >
        HD
      </text>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="vp-settings-svg vp-settings-svg--sm"
      aria-hidden="true"
    >
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="vp-settings-svg vp-settings-svg--sm"
      aria-hidden="true"
    >
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="vp-settings-svg vp-settings-svg--sm"
      aria-hidden="true"
    >
      <path
        d="M5 12l5 5L20 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SettingsPanel({
  playbackRates,
  player,
  state,
  onClose,
  isMobile,
  mode = "dropdown",
  themeClass = "",
  controlsVisible,
  triggerRef,
}: SettingsPanelProps) {
  const [view, setView] = useState<View>("main");
  const panelRef = useRef<HTMLDivElement>(null);

  // Click-outside: ignore clicks on the trigger button itself
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      if ((target as HTMLElement)?.closest?.(".vp-settings-anchor")) return;
      if ((target as HTMLElement)?.closest?.(".vp-top-controls__right")) return;
      onClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose, triggerRef]);

  const currentSpeed = state?.playbackRate || 1;
  const currentQuality = state?.selectedQuality ?? "auto";

  // ─── Sub-view: Main menu ─────────────────────────────────────────────────

  const renderMain = () => (
    <div className="vp-settings-scroll">
      <div className="vp-settings-section-title">Settings</div>
      <button
        type="button"
        className="vp-settings-option"
        onClick={() => setView("speed")}
      >
        <span className="vp-settings-icon">
          <SpeedIcon />
        </span>
        <span className="vp-settings-option-label">
          <span>Playback Speed</span>
          <span className="vp-settings-option-value">
            {currentSpeed === 1 ? "Normal" : `${currentSpeed}x`}
          </span>
        </span>
        <span className="vp-settings-chevron">
          <ChevronRight />
        </span>
      </button>
      <div className="vp-settings-divider" />
      <button
        type="button"
        className="vp-settings-option"
        onClick={() => setView("quality")}
      >
        <span className="vp-settings-icon">
          <QualityIcon />
        </span>
        <span className="vp-settings-option-label">
          <span>Quality</span>
          <span className="vp-settings-option-value">
            {currentQuality === "auto"
              ? "Auto"
              : state?.qualities.find((q) => q.id === currentQuality)?.label ||
                "Auto"}
          </span>
        </span>
        <span className="vp-settings-chevron">
          <ChevronRight />
        </span>
      </button>
    </div>
  );

  // ─── Sub-view: Speed picker ──────────────────────────────────────────────

  const renderSpeed = () => (
    <div className="vp-settings-scroll">
      <button
        type="button"
        className="vp-settings-option vp-settings-back"
        onClick={() => setView("main")}
      >
        <span className="vp-settings-back-arrow">
          <ChevronLeft />
        </span>
        <span>Playback Speed</span>
      </button>
      <div className="vp-settings-divider" />
      {(playbackRates ?? SPEEDS).map((speed) => (
        <button
          key={speed}
          type="button"
          className={`vp-settings-option ${currentSpeed === speed ? "is-active" : ""}`}
          onClick={() => {
            player?.setPlaybackRate(speed);
            onClose();
          }}
        >
          <span className="vp-settings-option-check">
            {currentSpeed === speed && <CheckIcon />}
          </span>
          <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
        </button>
      ))}
    </div>
  );

  // ─── Sub-view: Quality picker ────────────────────────────────────────────

  const renderQuality = () => (
    <div className="vp-settings-scroll">
      <button
        type="button"
        className="vp-settings-option vp-settings-back"
        onClick={() => setView("main")}
      >
        <span className="vp-settings-back-arrow">
          <ChevronLeft />
        </span>
        <span>Quality</span>
      </button>
      <div className="vp-settings-divider" />
      <button
        type="button"
        className={`vp-settings-option ${currentQuality === "auto" ? "is-active" : ""}`}
        onClick={() => {
          player?.setQuality("auto");
          onClose();
        }}
      >
        <span className="vp-settings-option-check">
          {currentQuality === "auto" && <CheckIcon />}
        </span>
        <span>Auto</span>
      </button>
      {state?.qualities.map((quality) => (
        <button
          key={quality.id}
          type="button"
          className={`vp-settings-option ${currentQuality === quality.id ? "is-active" : ""}`}
          onClick={() => {
            player?.setQuality(quality.id);
            onClose();
          }}
        >
          <span className="vp-settings-option-check">
            {currentQuality === quality.id && <CheckIcon />}
          </span>
          <span>{quality.label}</span>
        </button>
      ))}
    </div>
  );

  const content = (
    <>
      {view === "main" && renderMain()}
      {view === "speed" && renderSpeed()}
      {view === "quality" && renderQuality()}
    </>
  );

  // Block lower-level events so touches don't reach the player's touch/click handlers
  const blockEvent = (e: React.SyntheticEvent) => e.stopPropagation();

  // ─── Desktop dropdown mode ─────────────────────────────────────────────
  if (!isMobile && mode === "dropdown") {
    return (
      <div
        className={`vp-settings-dropdown ${themeClass}`.trim()}
        ref={panelRef}
        onClick={blockEvent}
        onTouchStart={blockEvent}
        onPointerDown={blockEvent}
      >
        {content}
      </div>
    );
  }

  // ─── Mobile dropdown mode → full overlay with centered panel ───────────
  if (isMobile && mode === "dropdown") {
    return (
      <div
        className="vp-settings-overlay"
        ref={panelRef}
        onClick={(e) => {
          e.stopPropagation();
          if (e.target === e.currentTarget) onClose();
        }}
        onTouchStart={blockEvent}
        onPointerDown={blockEvent}
      >
        <div className={`vp-settings-panel ${themeClass}`.trim()}>
          {content}
        </div>
      </div>
    );
  }

  // ─── Sheet mode → bottom sheet (mobile) or centered overlay (desktop) ──
  if (isMobile) {
    return (
      <>
        <div
          className="vp-settings-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        />
        <div
          className={`vp-settings-sheet ${themeClass}`.trim()}
          ref={panelRef}
          onClick={blockEvent}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        >
          {content}
        </div>
      </>
    );
  }

  // Desktop sheet → centered overlay
  return (
    <div
      className="vp-settings-overlay"
      ref={panelRef}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={blockEvent}
      onPointerDown={blockEvent}
    >
      <div className={`vp-settings-panel ${themeClass}`.trim()}>{content}</div>
    </div>
  );
}
