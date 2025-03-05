
import React from "react";
import ButtonCustom from "@/components/ui/button-custom";

interface Business {
  id: string;
  business_name: string;
  dti_certificate_no: string;
}

interface RegistrationRequest {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface RegistrationDetailsViewProps {
  selectedRequest: RegistrationRequest;
  selectedBusinesses: Business[];
  onClose: () => void;
  onApprove: (request: RegistrationRequest) => void;
  onReject: (request: RegistrationRequest) => void;
}

const RegistrationDetailsView: React.FC<RegistrationDetailsViewProps> = ({
  selectedRequest,
  selectedBusinesses,
  onClose,
  onApprove,
  onReject,
}) => {
  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Registration Details</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-500">Full Name</p>
          <p className="font-medium">
            {selectedRequest.first_name} {selectedRequest.middle_name || ''} {selectedRequest.last_name}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{selectedRequest.email}</p>
        </div>
        <div>
          <p className="text-gray-500">Application Date</p>
          <p className="font-medium">
            {new Date(selectedRequest.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      
      <h4 className="font-semibold mb-2">Business Details</h4>
      {selectedBusinesses && selectedBusinesses.length > 0 ? (
        <div className="space-y-4">
          {selectedBusinesses.map((business) => (
            <div key={business.id} className="p-4 bg-gray-50 rounded border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500">Business Name</p>
                  <p className="font-medium">{business.business_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">DTI Certificate No.</p>
                  <p className="font-medium">{business.dti_certificate_no}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No business details available</p>
      )}
      
      <div className="mt-6 flex justify-end space-x-4">
        <ButtonCustom
          onClick={() => onReject(selectedRequest)}
          className="bg-gray-500 hover:bg-gray-600"
        >
          REJECT
        </ButtonCustom>
        <ButtonCustom
          onClick={() => onApprove(selectedRequest)}
        >
          APPROVE
        </ButtonCustom>
      </div>
    </div>
  );
};

export default RegistrationDetailsView;
