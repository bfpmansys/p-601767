
import React from "react";

interface DashboardCardProps {
  title: string;
  count: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, count }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      <p className="text-3xl font-bold text-[#FE623F] mt-2">{count}</p>
    </div>
  );
};

export default DashboardCard;
