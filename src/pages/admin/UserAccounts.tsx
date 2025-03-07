
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ButtonCustom from "@/components/ui/button-custom";
import { CheckCircle, XCircle, Eye, Search } from "lucide-react";
import Header from "@/components/EODashboard/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
type UserType = "all" | "establishment" | "inspector" | "admin";
type UserStatus = "pending" | "active" | "rejected";

interface User {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  status: UserStatus;
  role: string;
  business_name?: string;
  dti_certificate_no?: string;
  registration_status?: string;
}

const UserAccounts: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<UserType>("all");
  
  // Check if admin is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all pending users
      const { data: pendingUsers, error: pendingError } = await supabase
        .from('pending_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (pendingError) throw pendingError;
      
      // Fetch pending businesses for each pending user
      const pendingUsersWithBusinesses = await Promise.all(
        (pendingUsers || []).map(async (user) => {
          const { data: businesses } = await supabase
            .from('pending_businesses')
            .select('*')
            .eq('pending_user_id', user.id);
            
          return {
            id: user.id,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            email: user.email,
            status: user.status as UserStatus,
            role: 'establishment', // Pending users are always establishment owners for now
            business_name: businesses && businesses.length > 0 ? businesses[0].business_name : '',
            dti_certificate_no: businesses && businesses.length > 0 ? businesses[0].dti_certificate_no : '',
            registration_status: 'pending'
          };
        })
      );

      // Fetch all approved users with their roles
      const { data: approvedUsers, error: approvedError } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (approvedError) throw approvedError;

      // Get roles for each approved user
      const approvedUsersWithRoles = await Promise.all(
        (approvedUsers || []).map(async (user) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id);
            
          const role = roles && roles.length > 0 ? roles[0].role : 'unknown';
          
          // Get businesses for establishment owners
          let business_name = '';
          let dti_certificate_no = '';
          let registration_status = 'unregistered';
          
          if (role === 'establishment') {
            const { data: businesses } = await supabase
              .from('approved_businesses')
              .select('*')
              .eq('user_id', user.id);
              
            if (businesses && businesses.length > 0) {
              business_name = businesses[0].business_name;
              dti_certificate_no = businesses[0].dti_certificate_no;
              registration_status = businesses[0].registration_status || 'unregistered';
            }
          }
          
          return {
            id: user.id,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            email: '', // We need to get this from auth.users which we can't access directly
            status: user.status as UserStatus || 'active',
            role,
            business_name,
            dti_certificate_no,
            registration_status
          };
        })
      );
      
      // Combine both lists
      const allUsers = [...pendingUsersWithBusinesses, ...approvedUsersWithRoles];
      
      // Get emails for approved users from auth (using the edge function)
      for (const user of allUsers) {
        if (user.status !== 'pending' && !user.email) {
          try {
            // This would be a call to an edge function to get user email
            // For now, we'll mock this by leaving email empty
            user.email = "";
          } catch (error) {
            console.error("Error fetching user email:", error);
          }
        }
      }
      
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on tab and search query
  useEffect(() => {
    let filtered = users;
    
    // Filter by role (tab)
    if (selectedTab !== "all") {
      filtered = filtered.filter(user => user.role === selectedTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.business_name && user.business_name.toLowerCase().includes(query)) ||
        (user.dti_certificate_no && user.dti_certificate_no.toLowerCase().includes(query))
      );
    }
    
    setFilteredUsers(filtered);
  }, [selectedTab, searchQuery, users]);

  const handleApprove = async (request: User) => {
    try {
      // Call the edge function to handle the approval process
      const { data, error } = await supabase.functions.invoke('approve-establishment', {
        body: { userId: request.id }
      });
      
      if (error) throw error;
      
      toast.success(`Registration for ${request.first_name} ${request.last_name} has been approved`);
      
      // Refresh the list
      fetchUsers();
    } catch (error: any) {
      console.error("Error approving request:", error);
      toast.error(error.message || "Failed to approve the registration");
    }
  };

  const handleReject = async (request: User) => {
    try {
      const { error } = await supabase
        .from('pending_users')
        .update({ status: 'rejected' })
        .eq('id', request.id);
        
      if (error) throw error;
      
      toast.success(`Registration for ${request.first_name} ${request.last_name} has been rejected`);
      
      // Refresh the list
      fetchUsers();
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject the registration");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">Active</span>;
      case 'pending':
        return <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 'rejected':
        return <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">Unknown</span>;
    }
  };

  const formatName = (first: string, middle: string | null, last: string) => {
    return `${last}, ${first} ${middle ? middle.charAt(0) + '.' : ''}`;
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F00]">Admin Dashboard</h1>
            <ButtonCustom onClick={handleLogout}>
              LOG OUT
            </ButtonCustom>
          </div>
          
          <div className="bg-[#FE623F] rounded-t-[20px] p-4">
            <h2 className="text-xl font-semibold text-white text-center">USER ACCOUNTS</h2>
          </div>
          
          <div className="bg-[#FFECE7] p-6 rounded-b-[20px] border border-[#524F4F] shadow-md">
            <Tabs defaultValue="all" onValueChange={(value) => setSelectedTab(value as UserType)}>
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-[#FFECE7]">
                  <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-[#FE623F] data-[state=active]:text-white px-6"
                  >
                    ALL
                  </TabsTrigger>
                  <TabsTrigger 
                    value="establishment"
                    className="data-[state=active]:bg-[#FE623F] data-[state=active]:text-white px-6"
                  >
                    EST. OWNERS
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inspector"
                    className="data-[state=active]:bg-[#FE623F] data-[state=active]:text-white px-6"
                  >
                    FIRE INSPECTOR
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin"
                    className="data-[state=active]:bg-[#FE623F] data-[state=active]:text-white px-6"
                  >
                    ADMIN
                  </TabsTrigger>
                </TabsList>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FE623F] focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
              
              <TabsContent value="all" className="mt-0">
                {renderUsersTable(filteredUsers)}
              </TabsContent>
              
              <TabsContent value="establishment" className="mt-0">
                {renderUsersTable(filteredUsers)}
              </TabsContent>
              
              <TabsContent value="inspector" className="mt-0">
                {renderUsersTable(filteredUsers)}
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0">
                {renderUsersTable(filteredUsers)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );

  function renderUsersTable(users: User[]) {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }
    
    if (users.length === 0) {
      return <div className="text-center py-8 text-gray-500">No users found</div>;
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FFF5F2] text-left">
              <th className="p-3 border-b font-semibold">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  ID NO
                </div>
              </th>
              <th className="p-3 border-b font-semibold">FULL NAME (LN, FN, MN)</th>
              <th className="p-3 border-b font-semibold">EMAIL ADDRESS</th>
              <th className="p-3 border-b font-semibold">BUSINESS NAME - DTI CERT NO.</th>
              <th className="p-3 border-b font-semibold">STATUS</th>
              <th className="p-3 border-b font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className={index % 2 === 0 ? 'bg-[#FFF5F2]' : 'bg-white'}>
                <td className="p-3 border-b">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    {user.id.substring(0, 8)}
                  </div>
                </td>
                <td className="p-3 border-b">
                  {formatName(user.first_name, user.middle_name, user.last_name)}
                </td>
                <td className="p-3 border-b">{user.email}</td>
                <td className="p-3 border-b">
                  {user.business_name ? `${user.business_name} - ${user.dti_certificate_no}` : 'N/A'}
                </td>
                <td className="p-3 border-b">
                  {getStatusBadge(user.status)}
                </td>
                <td className="p-3 border-b">
                  <div className="flex space-x-2">
                    <button
                      className="bg-[#FE623F] text-white rounded-full p-1 hover:bg-opacity-80"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(user)}
                          className="bg-green-500 text-white rounded-full p-1 hover:bg-opacity-80"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(user)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-opacity-80"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default UserAccounts;
