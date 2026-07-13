import { useEffect, useState, type FormEvent } from 'react';
import {
  HiOutlineAcademicCap,
  HiOutlineChatBubbleLeftRight,
  HiOutlineShieldCheck,
  HiOutlineUser,
} from 'react-icons/hi2';
import { useRouter } from '@tanstack/react-router';

import { useAuth } from '../auth';
import { roleRedirect } from '../lib/role-redirect';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@speaktoreach.local', password: 'admin123', icon: HiOutlineShieldCheck },
  { label: 'Teacher', email: 'maya@speaktoreach.local', password: 'teacher123', icon: HiOutlineAcademicCap },
  { label: 'Student', email: 'sara@example.com', password: 'student123', icon: HiOutlineUser },
] as const;

export function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      router.navigate({ to: roleRedirect(user) });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="login-brand">
          <div className="login-icon" aria-hidden>
            <HiOutlineChatBubbleLeftRight size={28} />
          </div>
          <div>
            <strong>Speak To Reach</strong>
            <small>Management System</small>
          </div>
        </div>

        <p className="login-hint">Choose a demo account or enter your credentials</p>
        <div className="login-role-picker" role="group" aria-label="Demo accounts">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.label}
              type="button"
              className={`login-role-card ${email === account.email ? 'active' : ''}`}
              onClick={() => fillCredentials(account.email, account.password)}
              aria-pressed={email === account.email}
            >
              <account.icon size={28} aria-hidden />
              <span>{account.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="error-msg" role="alert">
            {error}
          </div>
        )}

        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </label>
        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export function LoginRoute() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.navigate({ to: roleRedirect(user) });
    }
  }, [user, router]);

  if (user) return null;

  return <LoginPage />;
}
