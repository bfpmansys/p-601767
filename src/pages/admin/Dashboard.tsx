
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ButtonCustom from "@/components/ui/button-custom";
import { CheckCircle, XCircle, Eye, Users } from "lucide-react";
import Header from "@/components/EODashboard/Header";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState<any[]>([]);
  const [approvedUsersCount, setApprovedUsersCount] = useState(0);
  
  // Check if admin is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    } else {
      fetchPendingRequests();
      fetchApprovedUsersCount();
    }
  }, [navigate]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPendingRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching pending requests:", error);
      toast.error("Failed to load pending requests");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApprovedUsersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('approved_users')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      
      setApprovedUsersCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching approved users count:", error);
    }
  };

  const handleViewDetails = async (request: any) => {
    setSelectedRequest(request);
    
    try {
      const { data, error } = await supabase
        .from('pending_businesses')
        .select('*')
        .eq('pending_user_id', request.id);
        
      if (error) throw error;
      
      setSelectedBusinesses(data || []);
    } catch (error: any) {
      console.error("Error fetching business details:", error);
      toast.error("Failed to load business details");
    }
  };

  const handleApprove = async (request: any) => {
    try {
      // Call the edge function to handle the approval process
      const { data, error } = await supabase.functions.invoke('approve-establishment', {
        body: { userId: request.id }
      });
      
      if (error) throw error;
      
      toast.success(`Registration for ${request.first_name} ${request.last_name} has been approved`);
      
      // Refresh the list
      fetchPendingRequests();
      fetchApprovedUsersCount();
      setSelectedRequest(null);
      
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error(error.message || "Failed to approve the registration");
    }
  };

  const handleReject = async (request: any) => {
    try {
      const { error } = await supabase
        .from('pending_users')
        .update({ status: 'rejected' })
        .eq('id', request.id);
        
      if (error) throw error;
      
      toast.success(`Registration for ${request.first_name} ${request.last_name} has been rejected`);
      
      // Refresh the list
      fetchPendingRequests();
      setSelectedRequest(null);
      
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject the registration");
    }
  };

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  const navigateToUserAccounts = () => {
    navigate('/admin/user-accounts');
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F00]">Admin Dashboard</h1>
            <div className="flex gap-4">
              <ButtonCustom onClick={navigateToUserAccounts} className="flex items-center gap-2">
                <Users size={16} />
                USER ACCOUNTS
              </ButtonCustom>
              <ButtonCustom onClick={handleLogout}>
                LOG OUT
              </ButtonCustom>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Overview */}
            <div className="lg:col-span-1 bg-neutral-100 p-6 rounded-[20px] border border-[#524F4F]">
              <h2 className="text-2xl font-semibold mb-6">Overview</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <DashboardCard 
                  title="Pending Registrations" 
                  count={pendingRequests.length.toString()} 
                />
                <DashboardCard 
                  title="Approved Establishments" 
                  count={approvedUsersCount.toString()} 
                />
                <DashboardCard title="Total Inspections" count="0" />
              </div>
            </div>
            
            {/* Pending Registrations */}
            <div className="lg:col-span-2 bg-neutral-100 p-6 rounded-[20px] border border-[#524F4F]">
              <h2 className="text-2xl font-semibold mb-6">Pending Registrations</h2>
              
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending registration requests</div>
              ) : (
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
                                onClick={() => handleViewDetails(request)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye size={20} />
                              </button>
                              <button
                                onClick={() => handleApprove(request)}
                                className="p-1 text-green-600 hover:text-green-800"
                                title="Approve"
                              >
                                <CheckCircle size={20} />
                              </button>
                              <button
                                onClick={() => handleReject(request)}
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
              )}
              
              {selectedRequest && (
                <div className="mt-8 p-6 bg-white rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Registration Details</h3>
                    <button
                      onClick={() => setSelectedRequest(null)}
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
                  {selectedBusinesses.length > 0 ? (
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
                      onClick={() => handleReject(selectedRequest)}
                      className="bg-gray-500 hover:bg-gray-600"
                    >
                      REJECT
                    </ButtonCustom>
                    <ButtonCustom
                      onClick={() => handleApprove(selectedRequest)}
                    >
                      APPROVE
                    </ButtonCustom>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Dashboard card component
const DashboardCard: React.FC<{ title: string; count: string }> = ({ title, count }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      <p className="text-3xl font-bold text-[#FE623F] mt-2">{count}</p>
    </div>
  );
};

export default Dashboard;
