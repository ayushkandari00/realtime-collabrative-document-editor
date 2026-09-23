import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, PenLine, Eye, EyeOff } from 'lucide-react';
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
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
            Write together,<br />in real time.
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            A focused collaborative editor for teams who care about their writing.
          </p>
          <div className="mt-10 space-y-3">
            {['Real-time collaboration', 'Version history', 'Document sharing', 'PDF export'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
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
            <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-100 tracking-tight">Sign in</h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Welcome back to Cowrite</p>
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
