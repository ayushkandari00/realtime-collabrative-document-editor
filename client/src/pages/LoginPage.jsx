import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your ChatApp account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            autoComplete="current-password"
          />

          <div className="flex justify-end -mt-1">
            <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
