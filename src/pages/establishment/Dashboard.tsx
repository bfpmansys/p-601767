
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ButtonCustom from "@/components/ui/button-custom";
import { supabase } from "@/integrations/supabase/client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Bell } from "lucide-react";
import { EstablishmentCard } from "@/components/EODashboard/EstablishmentCard";
import { AddEstablishmentButton } from "@/components/EODashboard/AddEstablishmentButton";
import { UserProfile } from "@/components/EODashboard/UserProfile";
import { Sidebar } from "@/components/EODashboard/Sidebar";
import Header from "@/components/EODashboard/Header";


const EstablishmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [businessDetails, setBusinessDetails] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
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
        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from('approved_users')
          .select('first_name, last_name')
          .eq('id', userId)
          .single();
        
        if (userError) {
          console.error("Error fetching user details:", userError);
          throw userError;
        }
        
        if (userData) {
          setUserName(`${userData.first_name} ${userData.last_name}`);
        }
        
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
        toast.error("Failed to load your business details");
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
      
      <div className="flex">
        {(!isMobile || isMenuOpen) && (
          <Sidebar isMenuOpen={isMenuOpen} onClose={closeMenu} />
        )}
        <main className="flex-1 max-w-screen-xl mx-auto p-4">
          <div className="bg-[#FE623F] rounded-t-lg py-3 px-6 flex justify-between items-center">
            <h1 className="text-white font-bold text-lg">DASHBOARD</h1>
            <button className="text-white">
              <Bell size={20} />
            </button>
          </div>

          <div className="bg-[#FFEADB] rounded-b-lg p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="font-bold text-lg mb-2">GOOD DAY!</h2>
                <p className="text-sm text-gray-700">
                  We're thrilled to present our improved Establishment 
                  Portal designed with ease. Experience a seamless journey 
                  as you access your establishment information, inspection 
                  schedules and compliance updates all at your fingertips
                </p>
              </div>
              <UserProfile
                name={userName ? `${userName}!` : 'Welcome, Establishment Owner!'}
                userId="25-XXXX"
                establishmentCount={3}
                lastLogin="February 31, 2025"
              />
            </div>

            <div className="border-t border-gray-300 pt-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">ESTABLISHMENT INFORMATION</h2>
                <AddEstablishmentButton />
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-lg">Loading your business details...</p>
                ) : businessDetails.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {businessDetails.map((business, index) => (
                        <EstablishmentCard
                          key={index}
                          name={business.business_name}
                          dtiNumber={business.dti_certificate_no}
                          applicationType={business.application_type}
                          isRegistered={business.is_registered}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-lg">
                    No business records found. Please contact administration if this is an error.
                  </p>
                )}
              </div>

              <div className="text-right mt-4">
                <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  view all &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
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
