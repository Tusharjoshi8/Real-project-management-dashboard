import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Camera } from 'lucide-react';
import { toast } from 'sonner';

export const Profile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    updateUser({
      name: displayName,
      avatar: avatarUrl
    });

    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleChangePassword = () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        'New password must be at least 6 characters'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Mock password update
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    toast.success('Password changed successfully');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Profile
      </h1>

      <div className="grid gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">
            Profile Information
          </h2>

          <div className="flex items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={
                  avatarUrl ||
                  user?.avatar ||
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 border-gray-200"
              />

              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User size={16} className="inline mr-2" />
                  Display Name
                </label>

                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={e =>
                      setDisplayName(e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                ) : (
                  <p className="px-4 py-2">
                    {user?.name}
                  </p>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Avatar URL
                  </label>

                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={e =>
                      setAvatarUrl(e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>

                <p className="px-4 py-2 text-gray-600">
                  {user?.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Shield size={16} className="inline mr-2" />
                  Role
                </label>

                <p className="px-4 py-2">
                  <span className="capitalize px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setIsEditing(false);
                    setDisplayName(user?.name || '');
                    setAvatarUrl(user?.avatar || '');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">
            Change Password
          </h2>

          <div className="space-y-4 max-w-md">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={e =>
                setCurrentPassword(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={e =>
                setNewPassword(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e =>
                setConfirmPassword(e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg"
            />

            {passwordError && (
              <div className="text-red-600 text-sm">
                {passwordError}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};