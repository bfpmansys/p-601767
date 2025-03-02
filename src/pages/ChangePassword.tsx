
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/establishment-login");
        return;
      }
      setUser(data.session.user);
    };

    checkAuthStatus();
  }, [navigate]);

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (updateError) throw updateError;
      
      // Mark password as changed
      const { error: dbError } = await supabase
        .from('approved_users')
        .update({ password_changed: true })
        .eq('id', user.id);
      
      if (dbError) throw dbError;
      
      toast.success("Password changed successfully!");
      navigate("/establishment/dashboard");
      
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.message || "An error occurred while changing your password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <main className="flex-1 flex justify-center items-center p-6">
        <div className="w-full max-w-[500px] bg-neutral-100 rounded-[20px] border border-[#524F4F] p-8">
          <h1 className="text-[#F00] text-2xl font-bold mb-6 text-center">CHANGE PASSWORD</h1>
          
          <div className="mb-6 bg-yellow-100 p-4 rounded-lg">
            <p className="text-yellow-800">
              You need to change your temporary password before continuing.
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                className={`w-full p-3 rounded-lg bg-[#E2E2E2] ${errors.newPassword ? "border-2 border-red-500" : ""}`}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                className={`w-full p-3 rounded-lg bg-[#E2E2E2] ${errors.confirmPassword ? "border-2 border-red-500" : ""}`}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div className="flex justify-center">
              <ButtonCustom
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "CHANGING..." : "CHANGE PASSWORD"}
              </ButtonCustom>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
