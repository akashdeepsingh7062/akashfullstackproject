import { useAuth } from '../context/AuthContext';

export default function TaskList({ tasks, onStatus, onDelete }) {
  const { user } = useAuth();
  const canManage = user.role !== 'member';

  if (!tasks.length) return <p className="muted">No tasks found.</p>;

  return (
    <div className="grid">
      {tasks.map((t) => (
        <div className="card" key={t._id}>
          <div className="row between">
            <h4>{t.title}</h4>
            <span className={`badge p-${t.priority}`}>{t.priority}</span>
          </div>
          <p className="muted">{t.description || 'No description'}</p>
          <small>Assigned: {t.assignedTo?.name || '—'} | Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</small>
          <div className="row between" style={{ marginTop: 10 }}>
            <select value={t.status} onChange={(e) => onStatus(t._id, e.target.value)}>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
            {canManage && <button className="btn danger" onClick={() => onDelete(t._id)}>Delete</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
