"use client";

import React from "react";

interface CustomButtonProps {
  label: string;
  onClick: () => void;
  buttonType: "primary" | "secondary" | "disabled" | "secondary-outlined";
  customClasses?: string;
}

const getButtonStyle = (
  type: "primary" | "secondary" | "disabled" | "secondary-outlined"
) => {
  switch (type) {
    case "primary":
      return `bg-primary text-background`;
    case "secondary":
      return `bg-secondary text-background`;
    case "disabled":
      return `bg-gray text-lightWhite`;
    case "secondary-outlined":
      return `bg-transparent text-secondary border border-secondary`;
    default:
      return `bg-background text-primary`;
  }
};

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  buttonType = "primary",
  customClasses,
}) => {
  return (
    <button
      className={` text-xs md:text-sm xl:text-base md:py-2.5 py-1.5 px-2.5 rounded-lg h-auto cursor-pointer ${getButtonStyle(
        buttonType
      )} ${customClasses}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default CustomButton;
