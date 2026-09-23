import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AtSign, PenLine, Eye, EyeOff } from 'lucide-react';
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
    else if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) e.username = '3–20 chars, letters/numbers/_';
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
      toast.success('Account created — welcome to Cowrite! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left — editorial accent panel */}
      <div className="auth-panel-left">
        <div className="relative z-10 max-w-sm text-white">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <PenLine size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight">Cowrite</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Start writing<br />with your team.
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Create documents, invite collaborators, and write together — in real time.
          </p>
          <div className="mt-10 space-y-3">
            {['Free to get started', 'Invite unlimited collaborators', 'Autosave every 2 seconds', 'Full version history'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — registration form */}
      <div className="auth-panel-right">
        <div className="auth-card">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <PenLine size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-ink-900 dark:text-ink-100">Cowrite</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-100 tracking-tight">Create account</h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Join Cowrite and start writing together</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Full name"
                type="text"
                placeholder="Alice Chen"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={errors.name}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Username"
                type="text"
                placeholder="alice"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
                error={errors.username}
                leftIcon={<AtSign className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="alice@example.com"
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors">
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

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
