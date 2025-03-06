
import React, { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder: string;
  type?: "text" | "email" | "password";
  icon: string;
  iconAlt: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  (
    {
      label,
      placeholder,
      type = "text",
      icon,
      iconAlt,
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState(value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };

    const inputType = type === "password" && showPassword ? "text" : type;

    return (
      <div className={cn("w-full", className)}>
        <div className="text-black text-xl font-semibold self-start ml-14 mb-1.5 max-sm:text-lg max-sm:ml-5">
          {label}
        </div>
        <div className="w-[498px] h-16 flex items-center relative bg-[#E2E2E2] mx-14 mb-7 px-4 py-0 rounded-[20px] max-md:w-[90%] max-md:max-w-[498px] max-sm:h-14">
          <img src={icon} className="w-8 h-8" alt={iconAlt} />
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            className="bg-transparent border-none outline-none text-xl font-semibold ml-3 w-full text-black placeholder:text-[#9B9B9B] max-sm:text-lg"
            {...props}
          />
          {type === "password" && (
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/53101a4b8d9e90343971771b8ed800546628408a"
              className={`w-[30px] h-[30px] opacity-50 absolute right-4 cursor-pointer ${
                showPassword ? "opacity-100" : "opacity-50"
              }`}
              alt="Show Password"
              onClick={toggleShowPassword}
            />
          )}
        </div>
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
