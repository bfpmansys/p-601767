import React from "react";
import { cn } from "@/lib/utils";

interface ButtonCustomProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const ButtonCustom: React.FC<ButtonCustomProps> = ({
  children,
  onClick,
  className,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-40 h-[54px] text-white text-xl font-bold cursor-pointer bg-[#FE623F] flex items-center justify-center rounded-[20px] max-sm:w-[140px] max-sm:h-12 max-sm:text-lg",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
};

export default ButtonCustom;
