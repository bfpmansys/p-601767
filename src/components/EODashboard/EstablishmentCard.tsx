import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { ApplicationTypeModal } from "./ApplicationTypeModal";

interface EstablishmentCardProps {
  name: string;
  dtiNumber: string;
  applicationType?: string;
  isRegistered: boolean;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  name,
  dtiNumber,
  applicationType,
  isRegistered,
}) => {
  const navigate = useNavigate();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  const handleRegister = () => {
    navigate("/establishment-registration");
  };

  const handleApplyForCertification = () => {
    setIsApplicationModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className={`inline-block px-3 py-1 text-xs font-bold text-white rounded-full mb-2 ${
              isRegistered ? "bg-[#FE623F]" : "bg-[#FE623F]"
            }`}>
              {isRegistered ? "REGISTERED" : "UNREGISTERED"}
            </div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-gray-500 text-sm">
              Application Type: {applicationType || "------"}
            </p>
          </div>
          <div className="flex items-center">
            <p className="text-sm mr-2">DTI NO. {dtiNumber}</p>
            <button className="text-gray-400">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {!isRegistered ? (
        <div className="border-t border-gray-100 p-2">
          <button
            onClick={handleRegister}
            className="bg-[#FE623F] text-white rounded-md py-2 px-4 w-full flex items-center justify-center gap-2 hover:bg-opacity-90"
          >
            Register Establishment
            <span>→</span>
          </button>
        </div>
      ) : (
        <div className="border-t border-gray-100 p-2 grid grid-cols-2 gap-2">
          <button 
            className="bg-[#FE623F] text-white rounded-md py-2 px-4 w-full text-sm flex items-center justify-center gap-2 hover:bg-opacity-90"
            onClick={handleApplyForCertification}
          >
            Apply For Certification →
          </button>
          <button className="bg-[#FE623F] text-white rounded-md py-2 px-4 w-full text-sm flex items-center justify-center gap-2 hover:bg-opacity-90">
            View Est. Information →
          </button>
        </div>
      )}

      {/* Application Type Modal */}
      <ApplicationTypeModal 
        isOpen={isApplicationModalOpen} 
        onClose={() => setIsApplicationModalOpen(false)} 
      />
    </div>
  );
};
