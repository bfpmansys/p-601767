import { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

export const DashboardNavbar: FC = () => {
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

  return (
    <nav className="flex justify-between items-center h-20 bg-white px-8 border-b border-gray-300 shadow-sm">
      {/* Logo */}
      <div 
        onClick={() => navigate("/admin/dashboard")} 
        className="flex items-center gap-1 cursor-pointer"
      >
        <img src="/images/logo.png" alt="Logo" className="h-12" />
        <span className="text-2xl font-bold text-red-600 max-sm:text-base max-sm:hidden">V-FIRE</span>
        <span className="text-1xl font-bold text-black max-sm:text-base max-sm:hidden">INSPECT</span>
      </div>

      {/* Profile Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition">
          <User className="w-5 h-5 text-gray-600" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mt-2 shadow-lg">
          <DropdownMenuItem onClick={() => navigate("/edit-profile")}>
            <Settings className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} disabled={isLoading}>
            <LogOut className="w-4 h-4 mr-2" />
            {isLoading ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};


export default DashboardNavbar;