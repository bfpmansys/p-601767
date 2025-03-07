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
      const { data: pendingUsers, error: pendingError } = await supabase
        .from('pending_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (pendingError) throw pendingError;
      
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
            role: 'establishment',
            business_name: businesses && businesses.length > 0 ? businesses[0].business_name : '',
            dti_certificate_no: businesses && businesses.length > 0 ? businesses[0].dti_certificate_no : '',
            registration_status: 'pending'
          };
        })
      );

      const { data: approvedUsers, error: approvedError } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (approvedError) throw approvedError;

      const approvedUsersWithRoles = await Promise.all(
        (approvedUsers || []).map(async (user) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id);
            
          const role = roles && roles.length > 0 ? roles[0].role : 'unknown';
          
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
            email: '',
            status: user.status as UserStatus || 'active',
            role,
            business_name,
            dti_certificate_no,
            registration_status
          };
        })
      );
      
      const allUsers = [...pendingUsersWithBusinesses, ...approvedUsersWithRoles];
      
      for (const user of allUsers) {
        if (user.status !== 'pending' && !user.email) {
          try {
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

  useEffect(() => {
    let filtered = users;
    
    if (selectedTab !== "all") {
      filtered = filtered.filter(user => user.role === selectedTab);
    }
    
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
      const { data, error } = await supabase.functions.invoke('approve-establishment', {
        body: { userId: request.id }
      });
      
      if (error) throw error;
      
      toast.success(`Registration for ${request.first_name} ${request.last_name} has been approved`);
      
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

  const renderUsersTable = (users: User[]) => {
    if (isLoading) {
      return <div className="text-center py-8">Loading...</div>;
    }
    
    if (users.length === 0) {
      return <div className="text-center py-8 text-gray-500">No users found</div>;
    }
    
    return (
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              <th className="px-4 py-3 bg-[#FE623F] text-white text-left">ID NO.</th>
              <th className="px-4 py-3 bg-[#FE623F] text-white text-left">FULL NAME</th>
              <th className="px-4 py-3 bg-[#FE623F] text-white text-left">EMAIL ADDRESS</th>
              <th className="px-4 py-3 bg-[#FE623F] text-white text-left">BUSINESS INFO</th>
              <th className="px-4 py-3 bg-[#FE623F] text-white text-left">STATUS</th>
              <th className="px-4 py-3 bg-[#FE623F] text-white text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={user.id} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="px-4 py-3 border-b">{user.id.substring(0, 8)}</td>
                <td className="px-4 py-3 border-b">
                  {formatName(user.first_name, user.middle_name, user.last_name)}
                </td>
                <td className="px-4 py-3 border-b">{user.email}</td>
                <td className="px-4 py-3 border-b">
                  {user.business_name ? (
                    <div>
                      <div>Name: {user.business_name}</div>
                      <div>DTI Cert: {user.dti_certificate_no}</div>
                      <div>Status: {user.registration_status}</div>
                    </div>
                  ) : 'N/A'}
                </td>
                <td className="px-4 py-3 border-b">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}`}>
                    {user.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="flex space-x-2">
                    <button
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(user)}
                          className="p-1 text-green-500 hover:text-green-700"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(user)}
                          className="p-1 text-red-500 hover:text-red-700"
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
  };

  return (
    <div className="font-poppins min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#F00]">User Management</h1>
            <ButtonCustom onClick={handleLogout}>LOG OUT</ButtonCustom>
          </div>
          
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Tabs defaultValue="all" onValueChange={(value) => setSelectedTab(value as UserType)}>
                  <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="all" className="px-4 py-2">
                      ALL USERS
                    </TabsTrigger>
                    <TabsTrigger value="establishment" className="px-4 py-2">
                      ESTABLISHMENT OWNERS
                    </TabsTrigger>
                    <TabsTrigger value="inspector" className="px-4 py-2">
                      FIRE INSPECTORS
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="px-4 py-2">
                      ADMINS
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="pl-10 pr-4 py-2 border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
              </div>
            </div>

            <TabsContent value="all" className="p-4">
              {renderUsersTable(filteredUsers)}
            </TabsContent>
            
            <TabsContent value="establishment" className="p-4">
              {renderUsersTable(filteredUsers)}
            </TabsContent>
            
            <TabsContent value="inspector" className="p-4">
              {renderUsersTable(filteredUsers)}
            </TabsContent>
            
            <TabsContent value="admin" className="p-4">
              {renderUsersTable(filteredUsers)}
            </TabsContent>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAccounts;
