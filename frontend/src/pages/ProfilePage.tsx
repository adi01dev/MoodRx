
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Loader2, Save } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  goalsAndInterests: string;
  notificationsEnabled: boolean;
  privacyLevel: "public" | "private" | "community";
  theme: "light" | "dark" | "system";
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || "",
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    bio: "",
    goalsAndInterests: "",
    notificationsEnabled: true,
    privacyLevel: "community",
    theme: "light",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users/profile');
      setProfile({
        ...profile,
        ...response.data,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Could not load your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleToggleChange = (checked: boolean) => {
    setProfile({
      ...profile,
      notificationsEnabled: checked,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await api.put('/users/profile', profile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Could not update your profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Manage your personal details and account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={profile.role} 
                      onValueChange={(value) => handleSelectChange("role", value)}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us a little about yourself"
                      value={profile.bio}
                      onChange={handleChange}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goalsAndInterests">Wellness Goals & Interests</Label>
                    <Textarea
                      id="goalsAndInterests"
                      name="goalsAndInterests"
                      placeholder="What are your mental wellness goals and interests?"
                      value={profile.goalsAndInterests}
                      onChange={handleChange}
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your app preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive check-in reminders and recommendations
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={profile.notificationsEnabled}
                      onCheckedChange={handleToggleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="privacyLevel">Privacy Level</Label>
                    <Select 
                      value={profile.privacyLevel} 
                      onValueChange={(value) => handleSelectChange("privacyLevel", value as "public" | "private" | "community")}
                    >
                      <SelectTrigger id="privacyLevel">
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public - Anyone can see my profile</SelectItem>
                        <SelectItem value="community">Community - Only community members can see my profile</SelectItem>
                        <SelectItem value="private">Private - Hide my profile from others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">App Theme</Label>
                    <Select 
                      value={profile.theme} 
                      onValueChange={(value) => handleSelectChange("theme", value as "light" | "dark" | "system")}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select app theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="ml-auto bg-wellness-green hover:bg-wellness-green-dark text-white"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
