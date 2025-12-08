"use client";
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

const CustomButton = ({
  label,
  onClick,
  buttonType,
  customClasses,
}: CustomButtonProps) => {
  return (
    <button
      className={`font-normal text-xs md:text-sm xl:text-base md:py-2.5 py-1.5 px-2.5 rounded-md h-auto ${getButtonStyle(
        buttonType
      )} ${customClasses}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default CustomButton;
