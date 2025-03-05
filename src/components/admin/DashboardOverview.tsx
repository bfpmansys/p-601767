
import React from "react";
import DashboardCard from "./DashboardCard";

interface DashboardOverviewProps {
  pendingCount: number;
  approvedCount: number;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  pendingCount,
  approvedCount,
}) => {
  return (
    <div className="lg:col-span-1 bg-neutral-100 p-6 rounded-[20px] border border-[#524F4F]">
      <h2 className="text-2xl font-semibold mb-6">Overview</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <DashboardCard 
          title="Pending Registrations" 
          count={pendingCount.toString()} 
        />
        <DashboardCard 
          title="Approved Establishments" 
          count={approvedCount.toString()} 
        />
        <DashboardCard title="Total Inspections" count="0" />
      </div>
    </div>
  );
};

export default DashboardOverview;
