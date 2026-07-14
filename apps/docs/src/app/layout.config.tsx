import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";


/**
 * Shared layout configurations
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="flex items-center gap-2 font-bold text-base">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="url(#pk-grad)" />
          <polygon
            points="10,8 16,12 10,16"
            fill="white"
          />
          <defs>
            <linearGradient id="pk-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
        </svg>
        PlayerKit
      </span>
    ),
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
    {
      text: "Playground",
      url: process.env.NODE_ENV === "development" ? "http://localhost:5173/" : "/playerkit/playground/",
      external: true,
    },
    {
      text: "Changelog",
      url: "/changelog/v0.0.6",
    }
  ],
};
