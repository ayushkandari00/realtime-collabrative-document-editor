import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Min 2 characters';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) e.username = '3-20 chars, letters/numbers/underscores';
    if (!form.email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
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
      await register(form.name, form.email, form.password, form.username);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join ChatApp and start messaging</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Username"
              type="text"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
              error={errors.username}
              leftIcon={<AtSign className="w-4 h-4" />}
            />
          </div>

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
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Repeat password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
