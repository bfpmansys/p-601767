
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";

const EstablishmentDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if establishment owner is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('establishmentAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear establishment authentication
    localStorage.removeItem('establishmentAuthenticated');
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
            <p className="text-lg">
              This is your establishment dashboard. Here you can view your inspection history,
              upcoming inspections, and manage your establishment details.
            </p>
            
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
