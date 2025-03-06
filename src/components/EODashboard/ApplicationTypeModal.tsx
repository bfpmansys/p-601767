import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ApplicationTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationTypeCardProps {
  title: string;
  subtitle: string;
  onClick: () => void;
}

const ApplicationTypeCard: React.FC<ApplicationTypeCardProps> = ({ title, subtitle, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <FileText className="w-12 h-12 mb-4 text-gray-800" />
      <h3 className="text-center font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-center text-gray-600 text-sm mb-2">{subtitle}</p>
    </div>
  );
};

export const ApplicationTypeModal: React.FC<ApplicationTypeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleApplicationSelect = (type: string) => {
    // In a real application, you might pass the type to the next page
    navigate(`/application/${type}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-6">
            SELECT APPLICATION TYPE
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
          <ApplicationTypeCard
            title="Fire Safety Evaluation Clearance (FSEC)"
            subtitle="Apply for Evaluation"
            onClick={() => handleApplicationSelect("fsec")}
          />
          <ApplicationTypeCard
            title="Fire Safety Inspection Certificate (FSIC For Occupancy Permit)"
            subtitle="Apply for Occupancy Permit"
            onClick={() => handleApplicationSelect("fsic-occupancy")}
          />
          <ApplicationTypeCard
            title="Fire Safety Inspection Certificate (FSIC For Business Permit)"
            subtitle="Apply for Business Certificate"
            onClick={() => handleApplicationSelect("fsic-business")}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};