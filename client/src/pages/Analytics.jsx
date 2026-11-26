import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';

export default function Analytics() {
  const [months, setMonths] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/monthly').then((r) => setMonths(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  const list = months || [];
  const max = Math.max(1, ...list.flatMap((m) => [m.created, m.completed, m.missed]));
  const total = (k) => list.reduce((s, m) => s + m[k], 0);
  const h = (v) => `${(v / max) * 100}%`;

  return (
    <>
      <h2 className="page-title">📊 Monthly analysis</h2>
      <p className="muted">Your last 6 months of tasks.</p>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <div className="card"><b>{total('created')}</b><span>Created</span></div>
        <div className="card"><b>{total('completed')}</b><span>Completed</span></div>
        <div className="card"><b>{total('missed')}</b><span>Missed</span></div>
      </div>
      <div className="card">
        <div className="legend">
          <span className="dot c1" /> Created
          <span className="dot c2" /> Completed
          <span className="dot c3" /> Missed
        </div>
        <div className="bars">
          {list.map((m) => (
            <div className="bar-group" key={m.label}>
              <div className="bar-cols">
                <div className="bar c1" style={{ height: h(m.created) }}><i>{m.created || ''}</i></div>
                <div className="bar c2" style={{ height: h(m.completed) }}><i>{m.completed || ''}</i></div>
                <div className="bar c3" style={{ height: h(m.missed) }}><i>{m.missed || ''}</i></div>
              </div>
              <small>{m.label}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
