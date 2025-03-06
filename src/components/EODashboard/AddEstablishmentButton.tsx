import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export const AddEstablishmentButton: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <button 
      className="bg-[#FE623F] text-white rounded-full px-4 py-2 flex items-center gap-2 hover:bg-opacity-90 shadow-sm"
      onClick={() => navigate("/establishment-registration")}
    >
      <Plus size={16} />
      <span className="font-medium text-sm">ADD NEW ESTABLISHMENT</span>
    </button>
  );
};