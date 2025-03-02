
import React, { useEffect } from "react";
import Header from "@/components/common/Header";
import LoginCard from "@/components/auth/LoginCard";

const Index: React.FC = () => {
  useEffect(() => {
    // Add Poppins font to the document
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      // Clean up the font link when component unmounts
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
      <Header />
      <main className="flex-1">
        <LoginCard />
      </main>
    </div>
  );
};

export default Index;
