import React from "react";

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ children, className = "", ...rest }) {
  return (
    <svg {...baseProps} aria-hidden="true" className={className} {...rest}>
      {children}
    </svg>
  );
}

export function ServiceIcon({ name, variant = "outline", className = "" }) {
  const cls = `svc-svg ${variant} ${className}`.trim();

  switch (name) {
    case "plumbing":
      return (
        <Svg className={cls}>
          <path d="M10 3v6a4 4 0 0 0 8 0V3" />
          <path d="M18 3v6" />
          <path d="M14 13v8" />
          <path d="M10 21h8" />
        </Svg>
      );
    case "electrical":
      return (
        <Svg className={cls}>
          <path d="M13 2L4 14h7l-1 8 10-14h-7z" />
        </Svg>
      );
    case "carpentry":
      return (
        <Svg className={cls}>
          <path d="M14 4l6 6" />
          <path d="M3 21l7-7" />
          <path d="M11 13l3-3" />
          <path d="M16 8l-5 5" />
          <path d="M13 3l8 8-3 3-8-8z" />
        </Svg>
      );
    case "painting":
      return (
        <Svg className={cls}>
          <path d="M7 3h10v6H7z" />
          <path d="M9 9v4a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V9" />
          <path d="M5 21h14" />
          <path d="M12 16v5" />
        </Svg>
      );
    case "mounting":
      return (
        <Svg className={cls}>
          <rect x="4" y="5" width="16" height="11" rx="2" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
        </Svg>
      );
    case "drywall":
      return (
        <Svg className={cls}>
          <path d="M4 6h16" />
          <path d="M4 18h16" />
          <path d="M7 6v12" />
          <path d="M12 6v12" />
          <path d="M17 6v12" />
        </Svg>
      );
    case "doors":
      return (
        <Svg className={cls}>
          <path d="M7 3h10v18H7z" />
          <path d="M14 12h.01" />
        </Svg>
      );
    case "bathroom":
      return (
        <Svg className={cls}>
          <path d="M7 6h10" />
          <path d="M8 6V4h8v2" />
          <path d="M6 10h12" />
          <path d="M7 10v5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-5" />
        </Svg>
      );
    case "kitchen":
      return (
        <Svg className={cls}>
          <path d="M6 4h12v16H6z" />
          <path d="M9 8h6" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </Svg>
      );
    case "smarthome":
      return (
        <Svg className={cls}>
          <path d="M12 3l8 7v10a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1V10z" />
          <path d="M9 11a3 3 0 0 1 6 0" />
          <path d="M10.5 11a1.5 1.5 0 0 1 3 0" />
        </Svg>
      );
    case "assembly":
      return (
        <Svg className={cls}>
          <path d="M7 7l10 10" />
          <path d="M17 7L7 17" />
          <path d="M5 5h4v4H5z" />
          <path d="M15 15h4v4h-4z" />
        </Svg>
      );
    case "repairs":
    default:
      return (
        <Svg className={cls}>
          <path d="M14 7l3 3" />
          <path d="M4 20l6-6" />
          <path d="M12 8l-2-2a2 2 0 0 0-3 0l-1 1 5 5 1-1a2 2 0 0 0 0-3z" />
          <path d="M16 4l4 4-2 2-4-4z" />
        </Svg>
      );
  }
}
