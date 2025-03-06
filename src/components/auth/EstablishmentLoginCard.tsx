
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
      
      console.log("User authenticated:", authData.user.id);
      
      // Check if user has the establishment role, using a function we can invoke
      const { data: functionData, error: functionError } = await supabase.rpc(
        'has_role',
        { 
          _user_id: authData.user.id,
          _role: 'establishment'
        }
      );
      
      if (functionError) {
        console.error("Role check error:", functionError);
        throw functionError;
      }
      
      // If user does not have the role
      if (!functionData) {
        console.log("No establishment role found, checking pending status");
        
        // Check if the user has an approved pending registration
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_users')
          .select('*')
          .eq('email', data.email)
          .eq('status', 'approved')
          .maybeSingle();
        
        if (pendingError) {
          console.error("Pending check error:", pendingError);
          throw pendingError;
        }
        
        if (pendingData) {
          // User is approved but role hasn't been assigned yet
          // We need to call the edge function to assign the role
          try {
            const response = await fetch(`${window.location.origin}/api/assign-establishment-role`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({ userId: authData.user.id })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Failed to assign role");
            }
            
            console.log("Establishment role assigned to user");
          } catch (e) {
            console.error("Failed to assign role:", e);
            throw new Error("Error assigning establishment role. Please contact support.");
          }
        } else {
          throw new Error("You don't have establishment owner permissions. Your registration might be pending approval.");
        }
      }
      
      localStorage.setItem('establishmentAuthenticated', 'true');
      localStorage.setItem('userId', authData.user.id);
      
      toast.success("Welcome, Establishment Owner!");
      navigate("/establishment/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid credentials");
      
      // Sign out if there was an error with role verification
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
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
          <h1 className="text-4xl font-bold text-[#FF0000]">ESTABLISHMENT LOG IN</h1>
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
        
        <div className="mt-12 text-center">
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
