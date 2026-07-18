import { useState, useRef } from 'react';
import { Camera, Save, ArrowLeft, User, AtSign, Mail, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { uploadService } from '../services/uploadService';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) e.username = 'Invalid username format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Avatar must be under 5 MB'); return; }
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let avatarUrl = user?.avatar;

      if (avatar) {
        const result = await uploadService.uploadAvatar(avatar);
        avatarUrl = result.url;
      }

      const { data } = await authService.updateProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        bio: form.bio.trim(),
        avatar: avatarUrl,
      });

      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">My Profile</h1>
        <div className="flex-1" />
        <Button onClick={handleSave} loading={loading} size="sm">
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar src={preview} name={form.name || user?.name} size="2xl" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-lg transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-400">@{user?.username}</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-4 shadow-sm">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Personal Information</h2>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              error={errors.username}
              leftIcon={<AtSign className="w-4 h-4" />}
            />
          </div>

          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            inputClassName="opacity-60 cursor-not-allowed"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell others about yourself…"
              rows={3}
              maxLength={200}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <p className="text-xs text-gray-400 text-right">{form.bio.length}/200</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
