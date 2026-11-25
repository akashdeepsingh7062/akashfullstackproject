import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import AuthLayout from '../components/AuthLayout';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMsg(data.message);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit}>
        <h1>Set a new password 🔒</h1>
        <p className="sub">Choose a password with at least 6 characters</p>
        {error && <p className="error">{error}</p>}
        {msg && <p className="success">{msg}</p>}
        <label>New password
          <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </label>
        <button className="btn">Update password</button>
        <p className="switch"><Link to="/login">Go to login</Link></p>
      </form>
    </AuthLayout>
  );
}
