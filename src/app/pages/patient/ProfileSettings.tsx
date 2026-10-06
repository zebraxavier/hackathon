import React, { useEffect, useState } from 'react';
import { Save, X, User, Mail, Phone, MapPin, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout, { LoadingState } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../../services/profileService';

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  gender: '',
};

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

const TABS = [
  { id: 'profile', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
] as const;

type TabId = typeof TABS[number]['id'];

const ProfileSettings = () => {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(emptyProfile);
  const [originalData, setOriginalData] = useState(emptyProfile);
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    getProfile()
      .then(({ user }) => {
        const data = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
          gender: user.gender || '',
        };
        setProfileData(data);
        setOriginalData(data);
      })
      .catch((error) => toast.error(error.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const field = (key: keyof typeof emptyProfile) => ({
    value: profileData[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setProfileData((current) => ({ ...current, [key]: e.target.value })),
    disabled: !isEditing,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const { email, ...editable } = profileData;
      await updateProfile(editable);
      setOriginalData(profileData);
      updateUser({ name: profileData.name.trim() });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully');
      setPasswords(emptyPasswords);
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const passwordField = (key: keyof typeof emptyPasswords, label: string, autoComplete: string) => (
    <div className="col-md-6">
      <label className="form-label" htmlFor={`pw-${key}`}>{label}</label>
      <input
        id={`pw-${key}`}
        type="password"
        className="form-control"
        autoComplete={autoComplete}
        value={passwords[key]}
        onChange={(e) => setPasswords((current) => ({ ...current, [key]: e.target.value }))}
        required
      />
    </div>
  );

  return (
    <DashboardLayout title="Settings & Profile" subtitle="Manage your account details and security">
      {loading ? (
        <LoadingState label="Loading profile..." />
      ) : (
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-2" role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    className={`btn w-100 text-start d-flex align-items-center gap-2 mb-1 ${
                      activeTab === tab.id ? 'btn-primary' : 'btn-light'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            {activeTab === 'profile' && (
              <form className="card border-0 shadow-sm" onSubmit={handleSaveProfile}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0" style={{ fontFamily: 'Poppins, sans-serif' }}>Account Information</h5>
                    {!isEditing ? (
                      <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setProfileData(originalData);
                            setIsEditing(false);
                          }}
                          disabled={saving}
                        >
                          <X size={18} className="me-1" />
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-success" disabled={saving}>
                          <Save size={18} className="me-1" />
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2" htmlFor="profile-name">
                        <User size={16} className="text-primary" />
                        Full Name
                      </label>
                      <input id="profile-name" type="text" className="form-control" maxLength={100} {...field('name')} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2" htmlFor="profile-email">
                        <Mail size={16} className="text-primary" />
                        Email Address
                      </label>
                      <input id="profile-email" type="email" className="form-control" value={profileData.email} disabled readOnly />
                      <small className="text-muted">Email is used to sign in and cannot be changed here.</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2" htmlFor="profile-phone">
                        <Phone size={16} className="text-primary" />
                        Phone Number
                      </label>
                      <input id="profile-phone" type="tel" className="form-control" maxLength={30} {...field('phone')} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label d-flex align-items-center gap-2" htmlFor="profile-address">
                        <MapPin size={16} className="text-primary" />
                        Address
                      </label>
                      <input id="profile-address" type="text" className="form-control" maxLength={200} {...field('address')} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profile-dob">Date of Birth</label>
                      <input id="profile-dob" type="date" className="form-control" {...field('dateOfBirth')} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profile-gender">Gender</label>
                      <select id="profile-gender" className="form-select" {...field('gender')}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form className="card border-0 shadow-sm" onSubmit={handleChangePassword}>
                <div className="card-body p-4">
                  <h5 className="mb-4 d-flex align-items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <Lock size={20} />
                    Change Password
                  </h5>
                  <div className="row g-3 mb-4">
                    {passwordField('currentPassword', 'Current Password', 'current-password')}
                    <div className="w-100" />
                    {passwordField('newPassword', 'New Password', 'new-password')}
                    {passwordField('confirmPassword', 'Confirm New Password', 'new-password')}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                    {changingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfileSettings;
