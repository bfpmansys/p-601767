
import React, { useEffect } from "react";
import Header from "@/components/homepage/Header";
import AdminLoginCard from "@/components/auth/AdminLoginCard";

const Index: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <AdminLoginCard />
      </main>
    </div>
  );
};

export default Index;
