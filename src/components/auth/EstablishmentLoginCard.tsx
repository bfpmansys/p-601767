
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AuthInput from "./AuthInput";
import ButtonCustom from "../ui/button-custom";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const EstablishmentLoginCard: React.FC = () => {
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

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Sign in with Supabase Auth
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) throw error;
      
      // Check if user has the establishment role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('role', 'establishment')
        .maybeSingle();
      
      if (roleError) throw roleError;
      
      if (!roleData) {
        await supabase.auth.signOut();
        throw new Error("You don't have establishment owner permissions");
      }
      
      localStorage.setItem('establishmentAuthenticated', 'true');
      
      toast.success("Welcome, Establishment Owner!");
      navigate("/establishment/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center pt-[159px]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[605px] h-[564px] border flex flex-col items-center relative bg-neutral-100 rounded-[20px] border-solid border-[#524F4F] max-md:w-[90%] max-md:max-w-[605px] max-sm:h-auto max-sm:px-0 max-sm:py-5"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3498d51df3ff7e2a1f563eb8e42a91003b0e7ced"
          className="w-[88px] h-[131px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mt-3.5 rounded-[20px] max-sm:w-[70px] max-sm:h-[104px]"
          alt="Establishment Logo"
        />
        <h1 className="text-[#F00] text-[40px] font-bold mt-[35px] max-sm:text-[32px]">
          ESTABLISHMENT LOG IN
        </h1>

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

        <div 
          className="text-black text-base italic font-medium self-start ml-14 mt-1.5 cursor-pointer hover:underline"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </div>

        <ButtonCustom 
          type="submit" 
          className="mt-6"
          disabled={isLoading}
        >
          {isLoading ? "LOGGING IN..." : "LOG IN"}
        </ButtonCustom>
        
        <div className="mt-6 text-center">
          <p className="text-black text-base">
            Don't have an account?{" "}
            <span 
              className="text-[#FE623F] font-bold cursor-pointer"
              onClick={() => navigate("/establishment-register")}
            >
              Register
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default EstablishmentLoginCard;
