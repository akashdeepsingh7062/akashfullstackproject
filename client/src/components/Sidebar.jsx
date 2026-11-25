import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const [me, setMe] = useState(null);

  useEffect(() => {
    const load = () => api.get('/stats/me').then((r) => setMe(r.data)).catch(() => {});
    load();
    window.addEventListener('stats-refresh', load);
    return () => window.removeEventListener('stats-refresh', load);
  }, []);

  const staff = ['admin', 'manager'].includes(user.role);
  const link = (to, label, end) => (
    <NavLink to={to} end={end} onClick={onClose} className={({ isActive }) => 'side-link' + (isActive ? ' active' : '')}>
      {label}
    </NavLink>
  );

  return (
    <aside className={'sidebar' + (open ? ' open' : '')}>
      <div className="logo-badge"><img src="/logo-full.png" alt="TaskFlow" /></div>
      <div className="profile">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <b>{user.name}</b>
        <span className={`badge role-${user.role}`}>{user.role}</span>
        <small>{me && me.rank ? `Rank #${me.rank} of ${me.outOf}` : 'Rank: not ranked yet'}</small>
      </div>
      <div className="mini-stats">
        <div><b>{me ? me.live : '-'}</b><span>Live</span></div>
        <div><b>{me ? me.missed : '-'}</b><span>Missed</span></div>
        <div><b>{me ? me.scheduled : '-'}</b><span>Scheduled</span></div>
      </div>
      <nav>
        {link('/', '🏠 Home', true)}
        {link('/reminders', '⏰ Reminders')}
        {link('/leaderboard', '🏆 Leaderboard')}
        {link('/analytics', '📊 Monthly analysis')}
        {staff && link('/performance', '👥 User performance')}
      </nav>
      <button className="btn secondary logout" onClick={logout}>Logout</button>
    </aside>
  );
}
