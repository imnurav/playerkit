import type { ThemeSectionProps } from "../../types";
import { IconChevron } from "../../icons/index";
import React from "react";

const getValidHexColor = (val: string): string | null => {
  let hex = val.trim().replace(/^#/, "");
  if (hex.length === 3) {
    if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    } else {
      return null;
    }
  }
  if (hex.length === 6 && /^[0-9A-Fa-f]{6}$/.test(hex)) {
    return "#" + hex.toLowerCase();
  }
  return null;
};

export const ThemeSection: React.FC<ThemeSectionProps> = React.memo((props) => {
  const {
    onToggle,
    isExpanded,
    accentColor,
    accentColors,
    setAccentColor,
    customColorText,
    setCustomColorText,
  } = props;

  return (
    <section className="pg-section">
      <div
        className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
        onClick={onToggle}
      >
        <h2 className="pg-section-title">Dynamic Brand Colors</h2>
        <IconChevron className="pg-section-chevron" />
      </div>
      <div className={`pg-section-content ${isExpanded ? "is-expanded" : ""}`}>
        <div className="pg-section-inner">
          <div className="pg-theme-grid">
            <div className="pg-presets-wrapper">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`pg-color-swatch ${accentColor === color.value ? "is-active" : ""}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    setAccentColor(color.value);
                    setCustomColorText(color.value);
                  }}
                  title={color.label}
                />
              ))}
            </div>

            <div className="pg-custom-color-row">
              <div className="pg-color-input-wrapper">
                <input
                  type="color"
                  value={
                    accentColor.startsWith("#") && accentColor.length === 7
                      ? accentColor
                      : "#2e3192"
                  }
                  onChange={(e) => {
                    setAccentColor(e.target.value);
                    setCustomColorText(e.target.value);
                  }}
                  className="pg-color-picker"
                />
                <input
                  type="text"
                  placeholder="#2e3192"
                  value={customColorText}
                  onChange={(e) => {
                    setCustomColorText(e.target.value);
                    const validHex = getValidHexColor(e.target.value);
                    if (validHex) {
                      setAccentColor(validHex);
                    }
                  }}
                  className="pg-color-text-input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ThemeSection.displayName = "ThemeSection";
