"use client";
import { ButtonProps } from "@mui/material";
import Image from "next/image";
import React from "react";

interface CustomButtonProps extends ButtonProps {
  label?: string;
  onClick?: () => void;
  buttonType:
    | "primary"
    | "secondary"
    | "disabled"
    | "secondary-outlined"
    | "white-primary";
  customClasses?: string;
  disabled?: boolean;
  startIcon?: string;
}

const getButtonStyle = (
  type:
    | "primary"
    | "secondary"
    | "disabled"
    | "secondary-outlined"
    | "white-primary",
) => {
  switch (type) {
    case "primary":
      return `bg-primary text-background`;
    case "secondary":
      return `bg-secondary text-background`;
    case "disabled":
      return `bg-gray text-lightWhite hover:bg-gray-200 transition-all duration-300`;
    case "secondary-outlined":
      return `bg-transparent text-secondary border border-secondary`;
    case "white-primary":
      return `bg-background text-primary`;
    default:
      return `bg-background text-primary`;
  }
};

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  buttonType = "primary",
  customClasses,
  disabled,
  startIcon,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <button
      className={`text-xs md:text-sm xl:text-base md:py-2.5 py-2.5 px-2.5 rounded-lg h-auto cursor-pointer ${getButtonStyle(
        buttonType,
      )} ${customClasses}`}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {startIcon && (
        <Image
          title={label}
          src={startIcon}
          alt={buttonType}
          width={100}
          height={100}
          loading="eager"
          className="md:w-6 md:h-6 w-4 h-4"
        />
      )}
      {label}
    </button>
  );
};

export default CustomButton;
