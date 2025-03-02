
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    
    try {
      // Check if the user exists in our approved_users
      const { data: userData, error: userError } = await supabase
        .functions.invoke('request-password-reset', {
          body: { email: data.email }
        });
      
      if (userError) throw userError;
      
      setIsSubmitted(true);
      toast.success("If your email is registered, you will receive a temporary password shortly");
      
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <main className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-[500px] bg-neutral-100 rounded-[20px] border border-[#524F4F] p-8">
          <h1 className="text-[#F00] text-2xl font-bold mb-6 text-center">FORGOT PASSWORD</h1>
          
          {isSubmitted ? (
            <div className="text-center">
              <div className="mb-6 bg-green-100 p-4 rounded-lg">
                <p className="text-green-800">
                  If your email is registered in our system, you will receive a temporary password shortly.
                </p>
              </div>
              
              <p className="mb-6">
                Please check your email for instructions to reset your password.
              </p>
              
              <ButtonCustom
                onClick={() => navigate("/establishment-login")}
              >
                RETURN TO LOGIN
              </ButtonCustom>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <p className="mb-4 text-gray-600">
                Enter your email address below and we'll send you a temporary password.
              </p>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full p-3 rounded-lg bg-[#E2E2E2] ${errors.email ? "border-2 border-red-500" : ""}`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <ButtonCustom
                  type="button"
                  onClick={() => navigate("/establishment-login")}
                  className="bg-gray-500"
                >
                  BACK TO LOGIN
                </ButtonCustom>
                
                <ButtonCustom
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "SUBMITTING..." : "RESET PASSWORD"}
                </ButtonCustom>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
