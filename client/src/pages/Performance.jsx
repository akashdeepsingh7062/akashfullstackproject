import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';

export default function Performance() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/performance').then((r) => setRows(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <h2 className="page-title">👥 User performance</h2>
      <p className="muted">Completed and missed tasks for every member and manager.</p>
      {error && <p className="error">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Rank</th><th>Name</th><th>Role</th><th>Assigned</th><th>Completed</th><th>Live</th><th>Scheduled</th><th>Missed</th><th>Points</th></tr>
          </thead>
          <tbody>
            {(rows || []).map((r) => (
              <tr key={r.id}>
                <td>#{r.rank}</td>
                <td>{r.name}</td>
                <td><span className={`badge role-${r.role}`}>{r.role}</span></td>
                <td>{r.total}</td>
                <td>{r.done}</td>
                <td>{r.live}</td>
                <td>{r.scheduled}</td>
                <td className={r.missed ? 'bad' : ''}>{r.missed}</td>
                <td><b>{r.points}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows.length === 0 && <p className="muted">No members yet.</p>}
      </div>
    </>
  );
}
