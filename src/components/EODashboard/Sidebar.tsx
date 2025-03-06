import React, { useState } from "react";
import { Home, MessageCircle, Settings, User, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Sidebar: React.FC<{ isMenuOpen?: boolean; onClose?: () => void }> = ({ 
  isMenuOpen = true,
  onClose 
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/establishment-login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMobile && !isMenuOpen) {
    return null;
  }

  const SidebarIcon = ({ icon: Icon, label, onClick }: { icon: React.ElementType, label: string, onClick?: () => void }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={onClick} className="p-3 rounded-lg hover:bg-gray-100 mb-6 relative group">
          <Icon className="w-6 h-6 text-gray-600" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <nav className={`
      bg-white border-r border-gray-200
      flex flex-col items-center py-6 px-4 
      ${isMobile ? 'fixed top-0 left-0 h-full z-50 w-64' : 'w-16'}
    `}>
      <SidebarIcon icon={Home} label="Dashboard" onClick={() => navigate("/establishment/dashboard")} />
      <SidebarIcon icon={MessageCircle} label="Messages" />
      
      <div className="mt-auto">
        <SidebarIcon icon={User} label="Profile" onClick={() => navigate("/edit-profile")} />
        <SidebarIcon icon={LogOut} label="Logout" onClick={handleLogout} />
      </div>
    </nav>
  );
};