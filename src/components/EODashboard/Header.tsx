import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const EOHeader: FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center h-20 bg-white px-8 border-b border-gray-300 shadow-sm">
      {/* Logo */}
      <div 
        onClick={() => navigate("/establishment/dashboard")} 
        className="flex items-center gap-1 cursor-pointer"
      >
        <img src="/images/logo.png" alt="Logo" className="h-12" />
        <span className="text-2xl font-bold text-red-600 max-sm:text-base max-sm:hidden">V-FIRE</span>
        <span className="text-1xl font-bold text-black max-sm:text-base max-sm:hidden">INSPECT</span>
      </div>
    </nav>
  );
};


export default EOHeader;