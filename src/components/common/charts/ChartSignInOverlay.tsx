import React from "react";
import RippleButton from "@/src/components/button/RippleButton";

interface ChartSignInOverlayProps {
  onSignIn: () => void;
  title?: string;
  content?: string;
  monthContent?: string;
  bg?: string;
  className?: string;
}

const ChartSignInOverlay: React.FC<ChartSignInOverlayProps> = ({
  bg,
  title,
  content,
  monthContent,
  onSignIn,
  className,
}) => {
  return (
    <div
      onClick={onSignIn}
      className={`absolute inset-0 z-40 flex items-center justify-center ${bg || "bg-white/20"} backdrop-blur-[6px] rounded-2xl transition-all h-full cursor-pointer ${className || ""}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-gray-100 max-w-[280px] text-center cursor-default"
      >
        <div className="w-12 h-12 bg-[#FFA500]/10 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#FFA500]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-black">
            {title || "Unlock Full Insights"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {content ||
              `Please login in to view historical data beyond ${monthContent || "1 month"}.`}
          </p>
        </div>
        <RippleButton
          title="Log In"
          buttonType="tertiary"
          onClick={onSignIn}
          customClassName="w-full !py-3 !rounded-xl font-bold shadow-sm cursor-pointer"
          textClassName="!text-white !font-bold"
        />
      </div>
    </div>
  );
};

export default ChartSignInOverlay;
