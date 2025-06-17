
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Download, Upload, Eye, EyeOff } from 'lucide-react';
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
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setPartnerFirstName(data.partner_first_name || '');
      setPartnerLastName(data.partner_last_name || '');
    } catch (error: any) {
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
    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
      const { data: { user } } = await supabase.auth.getUser();
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
        <h1 className="text-3xl font-franklin-heavy">Profile Settings</h1>

        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="font-franklin-heavy">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-lg font-franklin-medium">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="outline" className="space-x-2" disabled={uploading}>
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
        <Card>
          <CardHeader>
            <CardTitle className="font-franklin-heavy">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="font-franklin-medium">Your First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="font-franklin-medium">Your Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerFirstName" className="font-franklin-medium">Partner's First Name</Label>
                <Input
                  id="partnerFirstName"
                  value={partnerFirstName}
                  onChange={(e) => setPartnerFirstName(e.target.value)}
                  placeholder="Partner's first name"
                />
              </div>
              <div>
                <Label htmlFor="partnerLastName" className="font-franklin-medium">Partner's Last Name</Label>
                <Input
                  id="partnerLastName"
                  value={partnerLastName}
                  onChange={(e) => setPartnerLastName(e.target.value)}
                  placeholder="Partner's last name"
                />
              </div>
            </div>
            <Button onClick={updateProfile} disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="font-franklin-heavy">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword" className="font-franklin-medium">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="font-franklin-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={updatePassword} disabled={!newPassword || !confirmPassword}>
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="font-franklin-heavy">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Button onClick={exportData} variant="outline" className="space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </Button>
              <p className="text-sm text-muted-foreground">
                Download all your expenses, goals, and profile data as a JSON file.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="data-import" className="cursor-pointer">
                <Button variant="outline" className="space-x-2">
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
