import type { Player, PlayerSnapshot } from "@varun/player-core";
import { useEffect, useRef, useState } from "react";

type View = "main" | "speed" | "quality";

export type SettingsPanelProps = {
  playbackRates: number[];
  player: Player | null;
  state: PlayerSnapshot | null;
  onClose: () => void;
  isMobile: boolean;
  /**
   * How the panel appears:
   * - "sheet"   → Fullscreen backdrop + bottom sheet (mobile) or centered overlay (desktop)
   * - "dropdown" → Small panel near the trigger button (desktop) or fullscreen overlay (mobile)
   * @default "sheet"
   */
  mode?: "sheet" | "dropdown";
  themeClass?: string;
  /** When true, parent controls are visible; when false, close (auto-hide) */
  controlsVisible?: boolean;
  /** Ref to the gear button element — clicks on it should NOT close the panel */
  triggerRef?: React.RefObject<HTMLElement | null>;
};

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export function SettingsPanel({
  playbackRates,
  player,
  state,
  onClose,
  isMobile,
  mode = "sheet",
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
      // If click is inside the panel, ignore
      if (panelRef.current?.contains(target)) return;
      // If click is on the trigger button (gear icon), ignore — gear's onClick handles toggling
      if (triggerRef?.current?.contains(target)) return;
      // Check if target is within any .vhp-settings-anchor (the wrapper around gear + dropdown)
      if ((target as HTMLElement)?.closest?.(".vhp-settings-anchor")) return;
      // Check top-right controls (mobile fullscreen/settings buttons)
      if ((target as HTMLElement)?.closest?.(".vhp-top-controls-right")) return;
      onClose();
    };
    // Delay one tick to avoid catching the click that opened it
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

  // Mobile: "sheet" → bottom sheet | "dropdown" → fullscreen overlay
  // Desktop: "sheet" → centered overlay | "dropdown" → small panel near trigger
  // "sheet" mode → bottom sheet (mobile) or centered overlay (desktop)
  // "dropdown" mode → small panel near trigger (desktop), fullscreen overlay (mobile)
  const isBottomSheet = mode === "sheet";
  const isOverlayCentered = mode === "sheet"; // desktop sheet = centered overlay
  const isOverlayFull = mode === "dropdown" && isMobile; // mobile dropdown = full overlay
  const containerClass = isMobile
    ? isBottomSheet
      ? `vhp-settings-sheet ${themeClass}`
      : `vhp-settings-overlay`
    : isOverlayCentered
      ? "vhp-settings-overlay"
      : `vhp-settings-dropdown ${themeClass}`;

  const renderBack = () => (
    <button
      type="button"
      className="vhp-settings-option vhp-settings-back"
      onClick={() => setView("main")}
    >
      <span className="vhp-settings-back-arrow">←</span>
      <span>Back</span>
    </button>
  );

  const renderMain = () => (
    <div className="vhp-settings-scroll h-10">
      <button
        type="button"
        className="vhp-settings-option"
        onClick={() => setView("speed")}
      >
        <span className="vhp-settings-icon">⚡</span>
        <span className="vhp-settings-option-label">
          <span>Playback Speed</span>
          <span className="vhp-settings-option-value">
            {currentSpeed === 1 ? "Normal" : `${currentSpeed}x`}
          </span>
        </span>
        <span className="vhp-settings-chevron">→</span>
      </button>
      <div className="vhp-settings-divider" />
      <button
        type="button"
        className="vhp-settings-option"
        onClick={() => setView("quality")}
      >
        <span className="vhp-settings-icon"></span>
        <span className="vhp-settings-option-label">
          <span>Quality</span>
          <span className="vhp-settings-option-value">
            {currentQuality === "auto"
              ? "Auto"
              : state?.qualities.find((q) => q.id === currentQuality)?.label ||
              "Auto"}
          </span>
        </span>
        <span className="vhp-settings-chevron">→</span>
      </button>
    </div>
  );

  const renderSpeed = () => (
    <div className="vhp-settings-scroll">
      {renderBack()}
      <div className="vhp-settings-divider" />
      {(playbackRates ?? SPEEDS).map((speed) => (
        <button
          key={speed}
          type="button"
          className={`vhp-settings-option ${currentSpeed === speed ? "is-active" : ""}`}
          onClick={() => {
            player?.setPlaybackRate(speed);
            onClose();
          }}
        >
          <span className="vhp-settings-option-dot">
            {currentSpeed === speed ? "●" : "○"}
          </span>
          <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
          {currentSpeed === speed && (
            <span className="vhp-settings-check">✓</span>
          )}
        </button>
      ))}
    </div>
  );

  const renderQuality = () => (
    <div className="vhp-settings-scroll">
      {renderBack()}
      <div className="vhp-settings-divider" />
      <button
        type="button"
        className={`vhp-settings-option ${currentQuality === "auto" ? "is-active" : ""}`}
        onClick={() => {
          player?.setQuality("auto");
          onClose();
        }}
      >
        <span className="vhp-settings-option-dot">
          {currentQuality === "auto" ? "●" : "○"}
        </span>
        <span>Auto</span>
        {currentQuality === "auto" && (
          <span className="vhp-settings-check">✓</span>
        )}
      </button>
      {state?.qualities.map((quality) => (
        <button
          key={quality.id}
          type="button"
          className={`vhp-settings-option ${currentQuality === quality.id ? "is-active" : ""}`}
          onClick={() => {
            player?.setQuality(quality.id);
            onClose();
          }}
        >
          <span className="vhp-settings-option-dot">
            {currentQuality === quality.id ? "●" : "○"}
          </span>
          <span>{quality.label}</span>
          {currentQuality === quality.id && (
            <span className="vhp-settings-check">✓</span>
          )}
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

  // Wrap content in a visible panel when the outer container is just a backdrop/overlay
  const needsPanel = (!isMobile && isOverlayCentered) || (isMobile && !isBottomSheet);
  console.log({ needsPanel });

  const wrappedContent = needsPanel ? (
    <div className={`vhp-settings-panel ${isBottomSheet ? themeClass : ""}`}>
      {content}
    </div>
  ) : (
    content
  );

  // Block lower-level events so touches don't reach the player's touch/click handlers
  const blockEvent = (e: React.SyntheticEvent) => e.stopPropagation();
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {isMobile && isBottomSheet && (
        <div
          className="vhp-settings-backdrop"
          onClick={handleBackdropClick}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        />
      )}
      {isOverlayFull ? (
        <div
          className={containerClass}
          ref={panelRef}
          onClick={handleOverlayClick}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        >
          {wrappedContent}
        </div>
      ) : (
        <div
          className={containerClass}
          ref={panelRef}
          onClick={blockEvent}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        >
          {wrappedContent}
        </div>
      )}
    </>
  );
}
