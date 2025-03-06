
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginChoice from "./pages/Homepage";
import AdminDashboard from "./pages/admin/Dashboard";
import EstablishmentDashboard from "./pages/establishment/Dashboard";
import EstablishmentLoginCard from "./components/auth/EstablishmentLoginCard";
import EstablishmentRegister from "./pages/EstablishmentRegister";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import Header from "@/components/homepage/Header";
import Profile from "./components/common/Profile";
import EstablishmentRegistration from "./pages/establishment/EstablishmentRegistration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to login choice */}
          <Route path="/" element={<LoginChoice />} />
          
          {/* Admin routes */}
          <Route path="/admin-login" element={<Index />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Establishment routes */}
          <Route 
            path="/establishment-login" 
            element={
              <div className="min-h-screen flex flex-col bg-white font-['Poppins']">
                <Header />
                <main className="flex-1">
                  <EstablishmentLoginCard />
                </main>
              </div>
            } 
          />
          <Route path="/establishment/dashboard" element={<EstablishmentDashboard />} />
          <Route path="/establishment-register" element={<EstablishmentRegister />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/edit-profile" element={<Profile />} />
          <Route path="/establishment-registration" element={<EstablishmentRegistration />} />

          
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
