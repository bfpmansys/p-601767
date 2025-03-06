
import React from "react";
import Header from "@/components/homepage/Header";
import RegisterForm from "@/components/auth/RegisterForm";

const EstablishmentRegister: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <div className="flex flex-1 w-full">
        <div className="hidden md:flex md:w-1/2 relative">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/3498d51df3ff7e2a1f563eb8e42a91003b0e7ced"
            alt="V-FIRE INSPECT Image"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 flex justify-center items-center py-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default EstablishmentRegister;
