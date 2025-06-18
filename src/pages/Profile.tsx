
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordChange from '@/components/profile/PasswordChange';
import DataManagement from '@/components/profile/DataManagement';

const Profile = () => {
  const navigate = useNavigate();

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

        <ProfileForm />
        <PasswordChange />
        <DataManagement />
      </div>
    </div>
  );
};

export default Profile;
