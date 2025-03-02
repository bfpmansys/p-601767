
import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";

const LoginChoice: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-neutral-100 p-8 rounded-[20px] border border-[#524F4F] w-[605px] flex flex-col items-center max-md:w-[90%]">
          <h1 className="text-[#F00] text-[40px] font-bold mb-10 text-center max-sm:text-[32px]">
            Choose Login Type
          </h1>
          
          <div className="flex flex-col gap-6 w-full items-center">
            <Link to="/admin-login" className="w-full flex justify-center">
              <ButtonCustom className="w-[300px]">
                ADMIN LOGIN
              </ButtonCustom>
            </Link>
            
            <Link to="/establishment-login" className="w-full flex justify-center">
              <ButtonCustom className="w-[300px]">
                ESTABLISHMENT LOGIN
              </ButtonCustom>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginChoice;
