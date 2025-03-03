import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ButtonCustom from "@/components/ui/button-custom";

const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  businesses: z.array(
    z.object({
      business_name: z.string().min(1, "Business name is required"),
      dti_certificate_no: z.string().min(1, "DTI Certificate No. is required"),
    })
  ).min(1, "At least one business is required"),
  terms_agreement: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      businesses: [{ business_name: "", dti_certificate_no: "" }],
      terms_agreement: false,
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "businesses",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      const { data: existingPendingUsers, error: checkError } = await supabase
        .from("pending_users")
        .select("id")
        .eq("email", data.email)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingPendingUsers) {
        toast.error("This email is already registered and pending approval");
        setIsLoading(false);
        return;
      }
      
      const { data: existingUsers, error: userError } = await supabase
        .from("approved_users")
        .select("id, email")
        .eq("email", data.email);
        
      if (userError) throw userError;
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error("This email is already registered");
        setIsLoading(false);
        return;
      }
      
      const { data: newUser, error: insertError } = await supabase
        .from("pending_users")
        .insert({
          first_name: data.first_name,
          middle_name: data.middle_name || null,
          last_name: data.last_name,
          email: data.email,
          status: "pending",
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      const businessInserts = data.businesses.map(business => ({
        pending_user_id: newUser.id,
        business_name: business.business_name,
        dti_certificate_no: business.dti_certificate_no,
      }));
      
      const { error: businessError } = await supabase
        .from("pending_businesses")
        .insert(businessInserts);
        
      if (businessError) throw businessError;
      
      toast.success("Registration submitted successfully! Please wait for admin approval.");
      reset();
      navigate("/establishment-login");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[605px] min-h-[564px] border flex flex-col items-center relative bg-neutral-100 rounded-[20px] border-solid border-[#524F4F] max-md:w-[90%] max-md:max-w-[605px] max-sm:px-4 max-sm:py-6">
      <div className="text-[#F00] text-[32px] font-bold mt-[25px] mb-4 flex items-center">
        <img
          src="/lovable-uploads/6814d0fe-c948-41ff-9aab-b2dd91c4080b.png"
          alt="Fire Icon"
          className="w-8 h-8 mr-2"
        />
        REGISTER ACCOUNT
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="w-full px-8 max-sm:px-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-black font-semibold mb-1">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter First Name"
                className={`w-full h-10 rounded-lg bg-[#E2E2E2] px-3 ${
                  errors.first_name ? "border-2 border-red-500" : ""
                }`}
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-black font-semibold mb-1">
                Middle Name
              </label>
              <input
                type="text"
                placeholder="Enter Middle Name"
                className="w-full h-10 rounded-lg bg-[#E2E2E2] px-3"
                {...register("middle_name")}
              />
            </div>
            
            <div>
              <label className="block text-black font-semibold mb-1">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Last Name"
                className={`w-full h-10 rounded-lg bg-[#E2E2E2] px-3 ${
                  errors.last_name ? "border-2 border-red-500" : ""
                }`}
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-black font-semibold mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className={`w-full h-10 rounded-lg bg-[#E2E2E2] px-3 ${
                errors.email ? "border-2 border-red-500" : ""
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-black font-semibold">
                Business Details<span className="text-red-500">*</span>
              </label>
              <button 
                type="button"
                onClick={() => append({ business_name: "", dti_certificate_no: "" })}
                className="flex items-center text-[#FE623F] hover:text-red-700 transition-colors"
              >
                <Plus size={20} /> Add Another Establishment
              </button>
            </div>
            
            {errors.businesses && !Array.isArray(errors.businesses) && (
              <p className="text-red-500 text-sm mb-2">{errors.businesses.message}</p>
            )}
            
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row gap-3 mb-3 p-3 bg-white rounded-lg relative">
                <div className="flex-1">
                  <label className="block text-black font-semibold text-sm mb-1">
                    Business Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Business Name"
                    className={`w-full h-10 rounded-lg bg-[#E2E2E2] px-3 ${
                      errors.businesses?.[index]?.business_name ? "border-2 border-red-500" : ""
                    }`}
                    {...register(`businesses.${index}.business_name`)}
                  />
                  {errors.businesses?.[index]?.business_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businesses[index]?.business_name?.message}
                    </p>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="block text-black font-semibold text-sm mb-1">
                    DTI Certificate No.<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="XXXXXXX"
                      className={`w-full h-10 rounded-lg bg-[#E2E2E2] px-3 ${
                        errors.businesses?.[index]?.dti_certificate_no ? "border-2 border-red-500" : ""
                      }`}
                      {...register(`businesses.${index}.dti_certificate_no`)}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Check size={20} className="text-green-500" />
                    </div>
                  </div>
                  {errors.businesses?.[index]?.dti_certificate_no && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businesses[index]?.dti_certificate_no?.message}
                    </p>
                  )}
                </div>
                
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 mr-2"
              {...register("terms_agreement")}
            />
            <label htmlFor="terms" className="text-sm">
              By continuing, you agree to <span className="text-[#FE623F]">Terms and Conditions</span>
            </label>
          </div>
          {errors.terms_agreement && (
            <p className="text-red-500 text-sm mt-1">{errors.terms_agreement.message}</p>
          )}
          
          <div className="flex justify-center mt-4 mb-6">
            <ButtonCustom 
              type="submit" 
              disabled={isLoading}
              className="px-6"
            >
              {isLoading ? "SUBMITTING..." : "SIGN UP"}
            </ButtonCustom>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-sm">
              Already have an account?{" "}
              <span 
                className="text-[#FE623F] cursor-pointer"
                onClick={() => navigate("/establishment-login")}
              >
                Log In
              </span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
