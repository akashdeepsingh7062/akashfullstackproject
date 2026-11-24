import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Create account 🚀</h1>
        <p className="sub">Join TaskFlow and start organising your work</p>
        {error && <p className="error">{error}</p>}
        <label>Full name
          <input placeholder="Your name" value={form.name} onChange={set('name')} required />
        </label>
        <label>Email
          <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        </label>
        <label>Password
          <input type="password" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
        </label>
        <button className="btn">Register</button>
        <p className="switch">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </AuthLayout>
  );
}
