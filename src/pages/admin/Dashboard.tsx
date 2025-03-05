
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";
import DashboardOverview from "@/components/admin/DashboardOverview";
import PendingRegistrationsTable from "@/components/admin/PendingRegistrationsTable";
import RegistrationDetailsView from "@/components/admin/RegistrationDetailsView";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState<any[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  
  // Check if admin is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    } else {
      fetchPendingRequests();
      fetchApprovedCount();
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

  const fetchApprovedCount = async () => {
    try {
      const { count, error } = await supabase
        .from('approved_users')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      
      setApprovedCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching approved count:", error);
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
      toast.info("Processing approval, please wait...");
      
      // Call the edge function to handle the approval process
      const { data, error } = await supabase.functions.invoke('approve-establishment', {
        body: { userId: request.id }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to approve the registration");
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to approve the registration");
      }
      
      toast.success(`Registration for ${request.first_name} ${request.last_name} has been approved`);
      
      // Refresh the lists
      fetchPendingRequests();
      fetchApprovedCount();
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

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F00]">Admin Dashboard</h1>
            <ButtonCustom onClick={handleLogout}>
              LOG OUT
            </ButtonCustom>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Overview */}
            <DashboardOverview 
              pendingCount={pendingRequests.length} 
              approvedCount={approvedCount} 
            />
            
            {/* Pending Registrations */}
            <div className="lg:col-span-2 bg-neutral-100 p-6 rounded-[20px] border border-[#524F4F]">
              <h2 className="text-2xl font-semibold mb-6">Pending Registrations</h2>
              
              <PendingRegistrationsTable
                pendingRequests={pendingRequests}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onApprove={handleApprove}
                onReject={handleReject}
              />
              
              {selectedRequest && (
                <RegistrationDetailsView
                  selectedRequest={selectedRequest}
                  selectedBusinesses={selectedBusinesses}
                  onClose={() => setSelectedRequest(null)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
