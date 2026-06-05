import { useEffect, useRef, memo } from "react";

export type ShortcutsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ShortcutsModal = memo(function ShortcutsModal({
  isOpen,
  onClose,
}: ShortcutsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle pressing Escape to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    // Focus modal container if exists
    modalRef.current?.focus();

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="pk-shortcuts-backdrop"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className="pk-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="pk-shortcuts-header">
          <h2 className="pk-shortcuts-title">Keyboard Shortcuts</h2>
          <button
            className="pk-shortcuts-close"
            onClick={onClose}
            aria-label="Close shortcuts help"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pk-shortcuts-grid">
          {/* Category: Playback */}
          <div className="pk-shortcuts-category">
            <h3 className="pk-shortcuts-category-title">Playback</h3>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Play / Pause</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">Space</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Seek Backward 10s</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">←</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Seek Forward 10s</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">→</kbd>
              </div>
            </div>
          </div>

          {/* Category: Audio */}
          <div className="pk-shortcuts-category">
            <h3 className="pk-shortcuts-category-title">Audio</h3>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Volume Up 10%</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">↑</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Volume Down 10%</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">↓</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Mute / Unmute</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">M</kbd>
              </div>
            </div>
          </div>

          {/* Category: Speed */}
          <div className="pk-shortcuts-category">
            <h3 className="pk-shortcuts-category-title">Speed</h3>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Speed Up</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">Shift</kbd>
                <span>+</span>
                <kbd className="pk-shortcut-key">&gt;</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Slow Down</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">Shift</kbd>
                <span>+</span>
                <kbd className="pk-shortcut-key">&lt;</kbd>
              </div>
            </div>
          </div>

          {/* Category: Display */}
          <div className="pk-shortcuts-category">
            <h3 className="pk-shortcuts-category-title">Display</h3>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Fullscreen</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">F</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Aspect Ratio (Fit)</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">S</kbd>
              </div>
            </div>
            <div className="pk-shortcut-item">
              <span className="pk-shortcut-label">Shortcuts Help</span>
              <div className="pk-shortcut-key-wrapper">
                <kbd className="pk-shortcut-key">Shift</kbd>
                <span>+</span>
                <kbd className="pk-shortcut-key">?</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ShortcutsModal.displayName = "ShortcutsModal";
