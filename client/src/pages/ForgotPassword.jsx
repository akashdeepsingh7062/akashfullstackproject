import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMsg(data.message);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Forgot password? 🔑</h1>
        <p className="sub">Enter your email and we will send a reset link</p>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
        <label>Email
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn">Send reset link</button>
        <p className="switch"><Link to="/login">Back to login</Link></p>
      </form>
    </AuthLayout>
  );
}
