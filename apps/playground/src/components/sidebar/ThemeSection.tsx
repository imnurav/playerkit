import type { AccentColor } from "../../types";
import { IconChevron } from "../../icons";
import React from "react";

interface ThemeSectionProps {
  accentColor: string;
  setAccentColor: (color: string) => void;
  customColorText: string;
  setCustomColorText: (text: string) => void;
  accentColors: AccentColor[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const ThemeSection: React.FC<ThemeSectionProps> = React.memo((props) => {
  const {
    accentColor,
    setAccentColor,
    customColorText,
    setCustomColorText,
    accentColors,
    isExpanded,
    onToggle,
  } = props;

  return (
    <section className="pg-section">
      <div
        className={`pg-section-header ${isExpanded ? "is-expanded" : ""}`}
        onClick={onToggle}
      >
        <h2 className="pg-section-title">Dynamic Brand Colors</h2>
        <IconChevron />
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
                    if (
                      e.target.value.startsWith("#") &&
                      e.target.value.length === 7
                    ) {
                      setAccentColor(e.target.value);
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
