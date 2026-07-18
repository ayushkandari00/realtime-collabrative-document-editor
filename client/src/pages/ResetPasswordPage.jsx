import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset password</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your new password below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />
          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat new password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Reset Password
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Remembered it?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
