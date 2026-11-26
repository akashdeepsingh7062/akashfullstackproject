import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';

export default function Reminders() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stats/reminders').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  return (
    <>
      <h2 className="page-title">⏰ Reminders</h2>
      <p className="muted">Tasks that are overdue or due within the next 24 hours.</p>
      {error && <p className="error">{error}</p>}
      {items && items.length === 0 && <div className="card"><p>🎉 Nothing urgent. You are all caught up.</p></div>}
      <div className="reminder-list">
        {(items || []).map((t) => (
          <div key={t.id} className={'card reminder' + (t.overdue ? ' overdue' : '')}>
            <div>
              <h4>{t.title}</h4>
              <small>Due: {new Date(t.dueDate).toLocaleString()}{t.assignedTo ? ` · ${t.assignedTo}` : ''}</small>
            </div>
            <span className={'badge ' + (t.overdue ? 'p-high' : 'p-medium')}>{t.overdue ? 'Overdue' : 'Due soon'}</span>
          </div>
        ))}
      </div>
    </>
  );
}
