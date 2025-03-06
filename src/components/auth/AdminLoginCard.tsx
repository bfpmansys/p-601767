
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthInput from "./AuthInput";
import ButtonCustom from "../ui/button-custom";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Admin credentials
const ADMIN_EMAIL = "vfireinspectval@gmail.com";
const ADMIN_PASSWORD = "vfireinspectval2025";

const LoginCard: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    
    // Check if credentials match admin credentials
    if (data.email === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
      // Simulate API call delay
      setTimeout(() => {
        // Store admin authentication state
        localStorage.setItem('adminAuthenticated', 'true');
        
        // Navigate to admin dashboard
        toast.success("Welcome, Admin!");
        navigate("/admin/dashboard");
        setIsLoading(false);
      }, 1000);
    } else {
      // This would be where you check for establishment owner credentials
      // For now, we'll just show an error
      setTimeout(() => {
        toast.error("Invalid credentials!");
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="flex justify-center pt-[70px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[605px] h-[564px] border flex flex-col items-center relative bg-neutral-100 rounded-[20px] border-solid border-[#524F4F] max-md:w-[90%] max-md:max-w-[605px] max-sm:h-auto max-sm:px-0 max-sm:py-5"
      >
        <div className="flex flex-col items-center mb-8 mt-10">
          <img src="/images/logo.png" alt="V-Fire Logo" className="w-16 h-20 mb-4" />
          <h1 className="text-4xl font-bold text-[#FF0000]">ADMIN LOG IN</h1>
        </div>

        <AuthInput
          label="E-mail:"
          placeholder="Enter your E-mail"
          type="email"
          icon="https://cdn.builder.io/api/v1/image/assets/TEMP/bb75a0c80c993a6a1a4e3dcea8cac3d773f93c92"
          iconAlt="Email Icon"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-red-500 text-sm -mt-6 mb-2 self-start ml-14">
            {errors.email.message}
          </p>
        )}

        <AuthInput
          label="Password :"
          placeholder="Enter your Password"
          type="password"
          icon="https://cdn.builder.io/api/v1/image/assets/TEMP/64da3df5875be6a0f4c466434f8f11592a3e6b65"
          iconAlt="Password Icon"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-red-500 text-sm -mt-6 mb-2 self-start ml-14">
            {errors.password.message}
          </p>
        )}

        <div className="text-black text-base italic font-medium self-start ml-14 mt-1.5 cursor-pointer hover:underline">
          Forgot Password?
        </div>

        <ButtonCustom 
          type="submit" 
          className="mt-6"
          disabled={isLoading}
        >
          {isLoading ? "LOGGING IN..." : "LOG IN"}
        </ButtonCustom>
      </form>
    </div>
  );
};

export default LoginCard;
