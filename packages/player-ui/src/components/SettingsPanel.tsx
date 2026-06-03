import { useEffect, useRef, useState, useCallback } from "react";
import type { SettingsPanelProps } from "../types";

type View = "main" | "speed" | "quality";

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
          activeRef.current.querySelector(".vp-settings-scroll") ||
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
          ".vp-settings-option, .vp-settings-section-title",
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
          <span>Speed</span>
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
        <span>Speed</span>
      </button>
      <div className="vp-settings-divider" />
      {(playbackRates ?? SPEEDS).map((speed) => (
        <button
          key={speed}
          type="button"
          className={`vp-settings-option ${currentSpeed === speed ? "is-active" : ""}`}
          onClick={() => {
            player?.setPlaybackRate(speed);
            handleClose();
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
          handleClose();
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
            handleClose();
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

  // Unified sliding slides sub-container used for both desktop and mobile
  const slider = (
    <div
      className={`vp-settings-slider-container ${isMounted ? "has-transition" : ""}`.trim()}
      style={{ height: height ? `${height}px` : undefined }}
    >
      <div
        className="vp-settings-slider-track"
        style={{
          transform: `translateX(${
            view === "main" ? "0%" : view === "speed" ? "-33.333%" : "-66.666%"
          })`,
        }}
      >
        <div className="vp-settings-slide" ref={mainRef}>
          {renderMain()}
        </div>
        <div className="vp-settings-slide" ref={speedRef}>
          {renderSpeed()}
        </div>
        <div className="vp-settings-slide" ref={qualityRef}>
          {renderQuality()}
        </div>
      </div>
    </div>
  );

  const content = isMobileScreen ? (
    <div className="vp-settings-mobile-container-wrapper">
      <div className="vp-settings-sheet-handle" />
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
        className={`vp-settings-dropdown ${themeClass} ${isClosing ? "is-closing" : ""}`.trim()}
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
          className={`vp-settings-backdrop ${isClosing ? "is-closing" : ""}`.trim()}
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          onTouchStart={blockEvent}
          onPointerDown={blockEvent}
        />
        <div
          className={`vp-settings-sheet ${themeClass} ${isClosing ? "is-closing" : ""} ${isLandscape ? "is-landscape" : ""}`.trim()}
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
      className={`vp-settings-overlay ${isClosing ? "is-closing" : ""}`.trim()}
      ref={panelRef}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) handleClose();
      }}
      onTouchStart={blockEvent}
      onPointerDown={blockEvent}
    >
      <div
        className={`vp-settings-panel ${themeClass} ${isClosing ? "is-closing" : ""}`.trim()}
        style={{ width: width ? `${width}em` : undefined }}
      >
        {content}
      </div>
    </div>
  );
}
