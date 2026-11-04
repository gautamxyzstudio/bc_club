"use client";

import React from "react";

export interface DotButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  customClasses?: string;
  disabled?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  cityName?: string;
  isActive?: boolean;
  title?: string;
}

// Sample and benchmark city changes matching bcrem-homepage -map layout.html

const DotButton: React.FC<DotButtonProps> = ({
  onClick,
  customClasses,
  disabled,
  onMouseEnter,
  onMouseLeave,
  cityName = "",
  isActive = false,
  title,
  ...rest
}) => {
  const displayCity = cityName;

  // Sanitize any previous fixed width hitbox classes (e.g. w-11!, w-12!) from customClasses
  const sanitizedClasses =
    customClasses?.replace(/\bw-[\w!/\[\]-]+\b/g, "").trim() || "";

  return (
    <button
      type="button"
      data-city={cityName}
      aria-label={title || `${cityName || displayCity}`}
      title={title || `${displayCity}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group items-center gap-1 cursor-pointer whitespace-nowrap select-none transition-all duration-150 font-['Plus_Jakarta_Sans',sans-serif]
         ${isActive
          ? "bg-[#102A43] text-white border-2 border-[#EEA500] rounded-full py-1 pr-2 pl-2.5 text-[13px] font-bold z-30 shadow-[0_4px_12px_rgba(16,42,67,0.35)]"
          : "bg-white text-[#0F0F0F] border border-[#D9DDE3] rounded-full py-1.5 pr-2.75 pl-3 text-[11px] font-bold leading-[1.2] shadow-[0_2px_6px_rgba(0,0,0,0.2)] z-2 hover:border-[#102A43] hover:z-20 focus-visible:outline focus-visible:outline-[#EEA500] focus-visible:outline-offset-2"
        } ${sanitizedClasses}`}
      {...rest}
    >
      {/* Pulse ring for active selected state */}
      {isActive && (
        <span
          className="absolute -inset-1.5 rounded-full border-[3px] border-[#EEA500] pointer-events-none animate-ping opacity-75 motion-reduce:hidden"
          aria-hidden="true"
        />
      )}

      <span>{displayCity}</span>
    </button>
  );
};

export default DotButton;
