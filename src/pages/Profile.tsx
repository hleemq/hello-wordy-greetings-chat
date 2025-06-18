
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Download, Upload, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { exportDataToJson, triggerDownload } from '@/utils/offlineStorage';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  partner_first_name: string | null;
  partner_last_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [partnerFirstName, setPartnerFirstName] = useState('');
  const [partnerLastName, setPartnerLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPartnerFirstName(data.partner_first_name || '');
        setPartnerLastName(data.partner_last_name || '');
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            first_name: '',
            last_name: '',
            partner_first_name: '',
            partner_last_name: '',
          }])
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          partner_first_name: partnerFirstName,
          partner_last_name: partnerLastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });

      fetchProfile();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const exportData = async () => {
    try {
      const data = await exportDataToJson();
      const filename = `we-finance-backup-${new Date().toISOString().split('T')[0]}.json`;
      triggerDownload(data, filename);
      
      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const text = await file.text();
      const data = JSON.parse(text);

      toast({
        title: "Import Data",
        description: "Data import functionality coming soon. Your file has been read successfully.",
      });

      console.log('Imported data:', data);
    } catch (error: any) {
      console.error('Error importing data:', error);
      toast({
        title: "Error",
        description: "Failed to import data. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-midnight dark:text-cloud hover:bg-mindaro/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-franklin-heavy text-midnight dark:text-cloud">Profile Settings</h1>
        </div>

        {/* Avatar Section */}
        <Card className="border-mindaro/30 bg-cloud/50 dark:bg-midnight/90">
          <CardHeader>
            <CardTitle className="font-franklin-heavy text-midnight dark:text-cloud">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg font-franklin-medium bg-mindaro text-midnight">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" className="space-x-2 border-mindaro/50 hover:bg-mindaro/20" disabled={uploading}>
                    <Camera className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                  </Button>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="border-mindaro/30 bg-cloud/50 dark:bg-midnight/90">
          <CardHeader>
            <CardTitle className="font-franklin-heavy text-midnight dark:text-cloud">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="font-franklin-medium text-midnight dark:text-cloud">Your First Name (Hasnaa)</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="font-franklin-medium text-midnight dark:text-cloud">Your Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerFirstName" className="font-franklin-medium text-midnight dark:text-cloud">Partner's First Name (Achraf)</Label>
                <Input
                  id="partnerFirstName"
                  value={partnerFirstName}
                  onChange={(e) => setPartnerFirstName(e.target.value)}
                  placeholder="Partner's first name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
              </div>
              <div>
                <Label htmlFor="partnerLastName" className="font-franklin-medium text-midnight dark:text-cloud">Partner's Last Name</Label>
                <Input
                  id="partnerLastName"
                  value={partnerLastName}
                  onChange={(e) => setPartnerLastName(e.target.value)}
                  placeholder="Partner's last name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
              </div>
            </div>
            <Button onClick={updateProfile} disabled={updating} className="bg-sunshine hover:bg-sunshine/90 text-midnight">
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="border-mindaro/30 bg-cloud/50 dark:bg-midnight/90">
          <CardHeader>
            <CardTitle className="font-franklin-heavy text-midnight dark:text-cloud">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="font-franklin-medium text-midnight dark:text-cloud">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10 border-mindaro/30 focus:border-sunshine"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-mindaro/20"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="font-franklin-medium text-midnight dark:text-cloud">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="border-mindaro/30 focus:border-sunshine"
              />
            </div>
            <Button onClick={updatePassword} disabled={!newPassword || !confirmPassword} className="bg-sunshine hover:bg-sunshine/90 text-midnight">
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-mindaro/30 bg-cloud/50 dark:bg-midnight/90">
          <CardHeader>
            <CardTitle className="font-franklin-heavy text-midnight dark:text-cloud">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button onClick={exportData} variant="outline" className="space-x-2 border-mindaro/50 hover:bg-mindaro/20">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
              <p className="text-sm text-muted-foreground">
                Download all your expenses, goals, and profile data as a JSON file.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="data-import" className="cursor-pointer">
                <Button variant="outline" className="space-x-2 border-mindaro/50 hover:bg-mindaro/20">
                  <Upload className="h-4 w-4" />
                  <span>Import Data</span>
                </Button>
              </Label>
              <Input
                id="data-import"
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground">
                Import data from a previously exported JSON file.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
