import { useEffect, useRef, useState, useCallback } from "react";
import type { SettingsPanelProps } from "../types";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconQuality,
  IconSpeedSettings,
} from "../icons";

type View = "main" | "speed" | "quality";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SettingsPanel(props: SettingsPanelProps) {
  const {
    playbackRates,
    player,
    state,
    onClose,
    isMobile,
    mode = "dropdown",
    themeClass = "",
  } = props;
  const [view, setView] = useState<View>("main");
  const panelRef = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<number | undefined>(undefined);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const mainRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const qualityRef = useRef<HTMLDivElement>(null);

  // ─── Premium Exit Transition State & Callback ───
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 250); // Matches the exit animation duration (250ms)
  }, [onClose]);

  // Track initial mount state to prevent transition jitter
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // ─── Dynamic Responsive Orientation and Size Checking ───
  const [isMobileScreen, setIsMobileScreen] = useState(
    isMobile || (typeof window !== "undefined" && window.innerWidth <= 760),
  );
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== "undefined" && window.innerWidth > window.innerHeight,
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = isMobile || window.innerWidth <= 760;
      setIsMobileScreen(isMobileSize);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  useEffect(() => {
    let activeRef: React.RefObject<HTMLDivElement | null>;
    switch (view) {
      case "main":
        activeRef = mainRef;
        break;
      case "speed":
        activeRef = speedRef;
        break;
      case "quality":
        activeRef = qualityRef;
        break;
      default:
        activeRef = mainRef;
    }

    const handle = requestAnimationFrame(() => {
      if (activeRef.current) {
        const scrollEl =
          activeRef.current.querySelector(".pk-settings-scroll") ||
          activeRef.current;
        const scrollH = scrollEl.scrollHeight;
        const maxH =
          typeof window !== "undefined" ? window.innerHeight * 0.5 : 360;
        const targetHeight = Math.min(scrollH, maxH);
        setHeight(targetHeight);

        // Get the base font size of the settings panel to convert pixels to em units
        const baseFontSize =
          parseFloat(window.getComputedStyle(scrollEl).fontSize) || 14;

        // Dynamically measure natural content width of the active view
        const options = scrollEl.querySelectorAll(
          ".pk-settings-option, .pk-settings-section-title",
        );
        let maxOptionWidthEm = view === "main" ? 13.5 : 10; // baseline minimum width in em (with standard safety margin)
        options.forEach((opt) => {
          const clone = opt.cloneNode(true) as HTMLElement;
          clone.style.position = "absolute";
          clone.style.visibility = "hidden";
          clone.style.width = "auto";
          clone.style.maxWidth = "none";
          clone.style.whiteSpace = "nowrap";
          clone.style.pointerEvents = "none";
          clone.style.display = "inline-flex"; // force inline-flex

          // Force all elements inside the clone to have visible overflow and max-content min-width to prevent truncation
          const allEl = clone.getElementsByTagName("*");
          for (let i = 0; i < allEl.length; i++) {
            const el = allEl[i] as HTMLElement;
            el.style.overflow = "visible";
            el.style.textOverflow = "clip";
            el.style.minWidth = "max-content";
            el.style.width = "auto";
          }

          scrollEl.appendChild(clone);
          const w = clone.getBoundingClientRect().width;
          scrollEl.removeChild(clone);

          const wEm = w / baseFontSize;
          if (wEm > maxOptionWidthEm) {
            maxOptionWidthEm = wEm;
          }
        });

        // Add padding for scrollbar (in em units) if scrolling is enabled
        const hasScrollbar = scrollH > maxH;
        const targetWidthEm = maxOptionWidthEm + (hasScrollbar ? 0.85 : 0);
        setWidth(targetWidthEm);
      }
    });

    return () => cancelAnimationFrame(handle);
  }, [
    view,
    state?.qualities,
    state?.playbackRate,
    state?.selectedQuality,
    isMounted,
  ]);

  // Click-outside: handle closing when clicking outside the panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      handleClose();
    };
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleClose]);

  const currentSpeed = state?.playbackRate || 1;
  const currentQuality = state?.selectedQuality ?? "auto";

  // ─── Sub-view: Main menu ─────────────────────────────────────────────────
  const renderMain = () => (
    <div className="pk-settings-scroll">
      <div className="pk-settings-section-title">Settings</div>
      <button
        type="button"
        className="pk-settings-option"
        onClick={() => setView("speed")}
      >
        <span className="pk-settings-icon">
          <IconSpeedSettings className="pk-settings-svg" />
        </span>
        <span className="pk-settings-option-label">
          <span>Speed</span>
          <span className="pk-settings-option-value">
            {currentSpeed === 1 ? "Normal" : `${currentSpeed}x`}
          </span>
        </span>
        <span className="pk-settings-chevron">
          <IconChevronRight className="pk-settings-svg pk-settings-svg--sm" />
        </span>
      </button>
      <div className="pk-settings-divider" />
      <button
        type="button"
        className="pk-settings-option"
        onClick={() => setView("quality")}
      >
        <span className="pk-settings-icon">
          <IconQuality className="pk-settings-svg" />
        </span>
        <span className="pk-settings-option-label">
          <span>Quality</span>
          <span className="pk-settings-option-value">
            {currentQuality === "auto"
              ? "Auto"
              : state?.qualities.find((q) => q.id === currentQuality)?.label ||
              "Auto"}
          </span>
        </span>
        <span className="pk-settings-chevron">
          <IconChevronRight className="pk-settings-svg pk-settings-svg--sm" />
        </span>
      </button>
    </div>
  );

  // ─── Sub-view: Speed picker ──────────────────────────────────────────────
  const renderSpeed = () => (
    <div className="pk-settings-scroll">
      <button
        type="button"
        className="pk-settings-option pk-settings-back"
        onClick={() => setView("main")}
      >
        <span className="pk-settings-back-arrow">
          <IconChevronLeft className="pk-settings-svg pk-settings-svg--sm" />
        </span>
        <span>Speed</span>
      </button>
      <div className="pk-settings-divider" />
      {(playbackRates ?? SPEEDS).map((speed) => (
        <button
          key={speed}
          type="button"
          className={`pk-settings-option ${currentSpeed === speed ? "is-active" : ""}`}
          onClick={() => {
            player?.setPlaybackRate(speed);
            handleClose();
          }}
        >
          <span className="pk-settings-option-check">
            {currentSpeed === speed && (
              <IconCheck className="pk-settings-svg pk-settings-svg--sm" />
            )}
          </span>
          <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
        </button>
      ))}
    </div>
  );

  // ─── Sub-view: Quality picker ────────────────────────────────────────────
  const renderQuality = () => (
    <div className="pk-settings-scroll">
      <button
        type="button"
        className="pk-settings-option pk-settings-back"
        onClick={() => setView("main")}
      >
        <span className="pk-settings-back-arrow">
          <IconChevronLeft className="pk-settings-svg pk-settings-svg--sm" />
        </span>
        <span>Quality</span>
      </button>
      <div className="pk-settings-divider" />
      <button
        type="button"
        className={`pk-settings-option ${currentQuality === "auto" ? "is-active" : ""}`}
        onClick={() => {
          player?.setQuality("auto");
          handleClose();
        }}
      >
        <span className="pk-settings-option-check">
          {currentQuality === "auto" && (
            <IconCheck className="pk-settings-svg pk-settings-svg--sm" />
          )}
        </span>
        <span>Auto</span>
      </button>
      {state?.qualities.map((quality) => (
        <button
          key={quality.id}
          type="button"
          className={`pk-settings-option ${currentQuality === quality.id ? "is-active" : ""}`}
          onClick={() => {
            player?.setQuality(quality.id);
            handleClose();
          }}
        >
          <span className="pk-settings-option-check">
            {currentQuality === quality.id && (
              <IconCheck className="pk-settings-svg pk-settings-svg--sm" />
            )}
          </span>
          <span>{quality.label}</span>
        </button>
      ))}
    </div>
  );

  // Unified sliding slides sub-container used for both desktop and mobile
  const slider = (
    <div
      className={`pk-settings-slider-container ${isMounted ? "has-transition" : ""}`.trim()}
      style={{ height: height ? `${height}px` : undefined }}
    >
      <div
        className="pk-settings-slider-track"
        style={{
          transform: `translateX(${view === "main" ? "0%" : view === "speed" ? "-33.333%" : "-66.666%"
            })`,
        }}
      >
        <div className="pk-settings-slide" ref={mainRef}>
          {renderMain()}
        </div>
        <div className="pk-settings-slide" ref={speedRef}>
          {renderSpeed()}
        </div>
        <div className="pk-settings-slide" ref={qualityRef}>
          {renderQuality()}
        </div>
      </div>
    </div>
  );

  const content = isMobileScreen ? (
    <div className="pk-settings-mobile-container-wrapper">
      <div className="pk-settings-sheet-handle" />
      {slider}
    </div>
  ) : (
    slider
  );

  // Block lower-level events so touches don't reach the player's touch/click handlers
  const blockEvent = (e: React.SyntheticEvent) => e.stopPropagation();

  // ─── 1. Desktop dropdown mode (anchored relative to settings button) ─────
  if (!isMobileScreen && mode === "dropdown") {
    return (
      <div
        className={`pk-settings-dropdown ${themeClass} ${isClosing ? "is-closing" : ""}`.trim()}
        ref={panelRef}
        onClick={blockEvent}
        onTouchStart={blockEvent}
        onPointerDown={blockEvent}
        style={{ width: width ? `${width}em` : undefined }}
      >
        {content}
      </div>
    );
  }

  // ─── 2. Mobile Bottom Sheet (Portrait and Landscape) ─────────────────────
  if (isMobileScreen) {
    return (
      <>
        <div
          className={`pk-settings-backdrop ${isClosing ? "is-closing" : ""}`.trim()}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        />
        <div
          className={`pk-settings-sheet ${themeClass} ${isClosing ? "is-closing" : ""} ${isLandscape ? "is-landscape" : ""}`.trim()}
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

  // ─── 3. Desktop sheet (Centered Overlay modal fallback) ─────────────────
  return (
    <div
      className={`pk-settings-overlay ${isClosing ? "is-closing" : ""}`.trim()}
      ref={panelRef}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) handleClose();
      }}
      onTouchStart={blockEvent}
      onPointerDown={blockEvent}
    >
      <div
        className={`pk-settings-panel ${themeClass} ${isClosing ? "is-closing" : ""}`.trim()}
        style={{ width: width ? `${width}em` : undefined }}
      >
        {content}
      </div>
    </div>
  );
}
