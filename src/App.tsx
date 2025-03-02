
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginChoice from "./pages/LoginChoice";
import AdminDashboard from "./pages/admin/Dashboard";
import EstablishmentDashboard from "./pages/establishment/Dashboard";
import EstablishmentLoginCard from "./components/auth/EstablishmentLoginCard";

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
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

// Import Header for the establishment login route
import Header from "@/components/common/Header";
