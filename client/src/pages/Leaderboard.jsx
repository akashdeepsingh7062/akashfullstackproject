import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';

const medal = (r) => (r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : `#${r}`);

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/leaderboard').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <h2 className="page-title">🏆 Leaderboard</h2>
      <p className="muted">Points: +10 for each task finished on time, +5 if late, -3 for each missed task. Keep climbing for promotions!</p>
      {error && <p className="error">{error}</p>}
      <div className="card">
        <table>
          <thead><tr><th>Rank</th><th>Name</th><th>Role</th><th>Completed</th><th>Points</th></tr></thead>
          <tbody>
            {(rows || []).map((r) => (
              <tr key={r.id} className={r.id === user.id ? 'me-row' : ''}>
                <td>{medal(r.rank)}</td>
                <td>{r.name}{r.id === user.id ? ' (you)' : ''}</td>
                <td><span className={`badge role-${r.role}`}>{r.role}</span></td>
                <td>{r.done}</td>
                <td><b>{r.points}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows.length === 0 && <p className="muted">No ranked members yet.</p>}
      </div>
    </>
  );
}
