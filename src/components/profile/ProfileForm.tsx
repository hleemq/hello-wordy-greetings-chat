
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

const ProfileForm = () => {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [partnerFirstName, setPartnerFirstName] = useState(profile?.partner_first_name || '');
  const [partnerLastName, setPartnerLastName] = useState(profile?.partner_last_name || '');

  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPartnerFirstName(profile.partner_first_name || '');
      setPartnerLastName(profile.partner_last_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    const success = await updateProfile({
      first_name: firstName.trim() || null,
      last_name: lastName.trim() || null,
      partner_first_name: partnerFirstName.trim() || null,
      partner_last_name: partnerLastName.trim() || null,
    });

    if (success) {
      // The profile hook will handle the global update notification
      console.log('Profile updated successfully');
    }
    
    setUpdating(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setUploading(true);
    const file = event.target.files[0];
    await uploadAvatar(file);
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                {(firstName || 'H').charAt(0).toUpperCase()}{(partnerFirstName || 'A').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <Button variant="outline" className="space-x-2 border-mindaro/50 hover:bg-mindaro/20" disabled={uploading} asChild>
                  <div>
                    <Camera className="h-4 w-4" />
                    <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
                  </div>
                </Button>
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
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
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="font-franklin-medium text-midnight dark:text-cloud">
                  Your First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
                <p className="text-xs text-gray-500 mt-1">This will be used as "Hasnaa" in the app</p>
              </div>
              <div>
                <Label htmlFor="lastName" className="font-franklin-medium text-midnight dark:text-cloud">
                  Your Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerFirstName" className="font-franklin-medium text-midnight dark:text-cloud">
                  Partner's First Name
                </Label>
                <Input
                  id="partnerFirstName"
                  value={partnerFirstName}
                  onChange={(e) => setPartnerFirstName(e.target.value)}
                  placeholder="Enter partner's first name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
                <p className="text-xs text-gray-500 mt-1">This will be used as "Achraf" in the app</p>
              </div>
              <div>
                <Label htmlFor="partnerLastName" className="font-franklin-medium text-midnight dark:text-cloud">
                  Partner's Last Name
                </Label>
                <Input
                  id="partnerLastName"
                  value={partnerLastName}
                  onChange={(e) => setPartnerLastName(e.target.value)}
                  placeholder="Enter partner's last name"
                  className="border-mindaro/30 focus:border-sunshine"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={updating} 
              className="bg-sunshine hover:bg-sunshine/90 text-midnight w-full md:w-auto"
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
