
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/common/Header";
import ButtonCustom from "@/components/ui/button-custom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Check if admin is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

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
          
          <div className="bg-neutral-100 p-8 rounded-[20px] border border-[#524F4F]">
            <h2 className="text-2xl font-semibold mb-6">Welcome, Admin!</h2>
            <p className="text-lg">
              This is the admin dashboard for V-FIRE INSPECT. From here, you can manage inspections, 
              view reports, and oversee establishment owners' accounts.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <DashboardCard title="Pending Inspections" count="12" />
              <DashboardCard title="Completed Inspections" count="48" />
              <DashboardCard title="Registered Establishments" count="24" />
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

export default AdminDashboard;
