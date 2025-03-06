import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, Save, X, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@radix-ui/react-accordion";

interface ProfileData {
  id: string;
  email: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birthday: string;
  gender: string | null;
  contact_number: string | null;
  avatar_url: string | null;
}

const EditProfile: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Ensure profile exists
      if (!profile) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup",
          variant: "destructive",
        });
        return;
      }

      setProfileData({
        id: user.id,
        email: user.email || '',
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        contact_number: profile.contact_number,
        avatar_url: profile.avatar_url,
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          middle_name: profileData.middle_name,
          last_name: profileData.last_name,
          birthday: profileData.birthday,
          gender: profileData.gender,
          contact_number: profileData.contact_number,
          avatar_url: profileData.avatar_url,
        })
        .eq('id', profileData.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      await loadProfileData(); // Reload profile data to ensure we have the latest
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;

    // Password strength validation
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!passwordRegex.test(newPassword)) {
    //   toast({
    //     title: "Invalid password",
    //     description: "Password must be at least 8 characters long and contain uppercase, lowercase, number and special character",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileData) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profileData.id}/${crypto.randomUUID()}.${fileExt}`;

      // Delete old avatar if it exists
      if (profileData.avatar_url) {
        const oldFilePath = profileData.avatar_url.split('/').pop();
        if (oldFilePath) {
          await supabase.storage
            .from('avatars')
            .remove([`${profileData.id}/${oldFilePath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profileData.id);

      if (updateError) throw updateError;

      setProfileData({ ...profileData, avatar_url: publicUrl });
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profileData) return (
    <div className="min-h-screen bg-[#FFF5F2] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Loading profile...</h2>
        <p className="text-gray-600">Please wait while we fetch your information.</p>
      </div>
    </div>
  );

  

  return (
    <div className="min-h-screen bg-white font-['Poppins']">
      <Header />
      <div className="max-w-[1440px] bg-white mx-auto my-0">
      <div className="px-10 py-5 max-sm:px-2.5 max-sm:py-2.5">
      <div className="flex items-center bg-[#FE623F] p-5 rounded-[16px_16px_0_0]">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white flex items-center gap-2 mb-2"
        >
          <ChevronLeft size={20} />
          <span></span>
        </button>
        <h1 className="text-white text-xl font-semibold">VIEW PROFILE</h1>
      </div>

      <div className="container mx-auto p-6 bg-[#FFECDB]">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileData.avatar_url || ''} />
                <AvatarFallback>
                  {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>User Account No.</Label>
              <Input
                value={profileData.id.slice(0, 8)}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={profileData.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label>First Name</Label>
              <Input
                value={profileData.first_name}
                onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Middle Name</Label>
              <Input
                value={profileData.middle_name || ''}
                onChange={(e) => setProfileData({ ...profileData, middle_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                value={profileData.last_name}
                onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Birthday</Label>
              <Input
                type="date"
                value={profileData.birthday}
                onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                disabled={!isEditing}
                max={new Date().toISOString().split("T")[0]}  // Set max to today's date
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Select
                disabled={!isEditing}
                value={profileData.gender || ''}
                onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Contact Number</Label>
              <Input
                value={profileData.contact_number || ''}
                onChange={(e) => setProfileData({ ...profileData, contact_number: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#FE623F] text-white px-4 py-2 rounded-[15px] hover:bg-[#FE795C] transition duration-300"
                >
                  Edit Profile
                </Button>
                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-[#000] text-[#white] px-4 py-2 rounded-[15px] hover:bg-[#FE795C] hover:text-white transition duration-300"
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new password to change it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Current Password</Label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>New Password</Label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Password must be at least 8 characters and include uppercase, lowercase, number and special character.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(false)}
                      className="border-[#FE623F] text-[#FE623F] px-4 py-2 rounded-[15px] hover:bg-[#FE795C] hover:text-white transition duration-300"
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleChangePassword}
                      disabled={!currentPassword || !newPassword || isLoading}
                      className={`bg-[#FE623F] text-white px-4 py-2 rounded-[15px] hover:bg-[#FE795C] transition duration-300 ${isLoading || !currentPassword || !newPassword ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {isLoading ? "Saving..." : "Save Password"}
                    </Button>

                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfileData();
                  }}
                  className="border-[#FE623F] text-[#FE623F] px-4 py-2 rounded-[15px] hover:bg-[#FE795C] hover:text-white transition duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className={`bg-[#FE623F] text-white px-4 py-2 rounded-[15px] hover:bg-[#FE795C] transition duration-300 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default EditProfile;