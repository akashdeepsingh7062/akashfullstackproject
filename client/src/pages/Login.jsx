import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function Login() {
  const { user, login, guest } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const run = async (fn) => {
    try { setError(''); await fn(); navigate('/'); } catch (err) { setError(errMsg(err)); }
  };
  const submit = (e) => { e.preventDefault(); run(() => login(form.email, form.password)); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Welcome back 👋</h1>
        <p className="sub">Log in to your TaskFlow account</p>
        {error && <p className="error">{error}</p>}
        <label>Email
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </label>
        <label>Password
          <input type="password" placeholder="Enter your password" value={form.password} onChange={set('password')} required />
        </label>
        <Link className="forgot" to="/forgot-password">Forgot password?</Link>
        <button className="btn">Login</button>
        <button type="button" className="btn ghost" onClick={() => run(guest)}>Sign up as guest</button>
        <p className="switch">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
