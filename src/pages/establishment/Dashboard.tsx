
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";

const EstablishmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [businessDetails, setBusinessDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if establishment owner is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('establishmentAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    const fetchBusinessDetails = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error("No user ID found in localStorage");
        navigate('/');
        return;
      }

      try {
        // Fetch user's business details
        const { data, error } = await supabase
          .from('approved_businesses')
          .select('*')
          .eq('user_id', userId);
        
        if (error) {
          console.error("Error fetching business details:", error);
          throw error;
        }
        
        console.log("Business details fetched:", data);
        setBusinessDetails(data || []);
      } catch (error) {
        console.error("Failed to fetch business details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessDetails();
  }, [navigate]);

  const handleLogout = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear establishment authentication
    localStorage.removeItem('establishmentAuthenticated');
    localStorage.removeItem('userId');
    
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F00]">Establishment Dashboard</h1>
            <ButtonCustom onClick={handleLogout}>
              LOG OUT
            </ButtonCustom>
          </div>
          
          <div className="bg-neutral-100 p-8 rounded-[20px] border border-[#524F4F]">
            <h2 className="text-2xl font-semibold mb-6">Welcome, Establishment Owner!</h2>
            
            {isLoading ? (
              <p className="text-lg">Loading your business details...</p>
            ) : businessDetails.length > 0 ? (
              <>
                <h3 className="text-xl font-medium mb-4">Your Registered Businesses:</h3>
                <div className="space-y-4">
                  {businessDetails.map((business, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <h4 className="text-lg font-semibold text-[#FE623F]">{business.business_name}</h4>
                      <p className="mt-2"><span className="font-medium">DTI Certificate:</span> {business.dti_certificate_no}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-lg">No business records found. Please contact administration if this is an error.</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <DashboardCard title="Upcoming Inspections" count="2" />
              <DashboardCard title="Past Inspections" count="5" />
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

export default EstablishmentDashboard;
