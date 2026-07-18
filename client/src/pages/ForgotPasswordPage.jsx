import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Invalid email'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot password?</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter your email and we'll send you a reset link
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-gray-100">Check your inbox!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                We sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline mt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={error}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            <Button type="submit" loading={loading} size="lg" className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        {!sent && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            <Link to="/login" className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
