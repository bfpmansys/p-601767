
import React from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";

interface PendingRequest {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  created_at: string;
}

interface PendingRegistrationsTableProps {
  pendingRequests: PendingRequest[];
  isLoading: boolean;
  onViewDetails: (request: PendingRequest) => void;
  onApprove: (request: PendingRequest) => void;
  onReject: (request: PendingRequest) => void;
}

const PendingRegistrationsTable: React.FC<PendingRegistrationsTableProps> = ({
  pendingRequests,
  isLoading,
  onViewDetails,
  onApprove,
  onReject,
}) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (pendingRequests.length === 0) {
    return <div className="text-center py-8 text-gray-500">No pending registration requests</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full bg-white rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingRequests.map((request) => (
            <tr key={request.id} className="border-t border-gray-200">
              <td className="py-3 px-4">
                {request.first_name} {request.middle_name ? request.middle_name + ' ' : ''}{request.last_name}
              </td>
              <td className="py-3 px-4">{request.email}</td>
              <td className="py-3 px-4">
                {new Date(request.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewDetails(request)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => onApprove(request)}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Approve"
                  >
                    <CheckCircle size={20} />
                  </button>
                  <button
                    onClick={() => onReject(request)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Reject"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingRegistrationsTable;
