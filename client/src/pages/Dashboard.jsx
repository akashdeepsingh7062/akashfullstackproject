import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Banner from '../components/Banner';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import UserManager from '../components/UserManager';

export default function Dashboard() {
  const { user } = useAuth();
  const staff = ['admin', 'manager'].includes(user.role);
  const isAdmin = user.role === 'admin';
  const [params] = useSearchParams();
  const q = (params.get('q') || '').toLowerCase();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      setTasks((await api.get('/tasks')).data);
    } catch (e) { setError(errMsg(e)); }
  }, []);

  const loadUsers = useCallback(async () => {
    if (!staff) return;
    try {
      setUsers((await api.get('/users')).data);
    } catch (e) { setError(errMsg(e)); }
  }, [staff]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const refresh = async () => {
    await loadTasks();
    window.dispatchEvent(new Event('stats-refresh'));
  };
  const wrap = (fn) => async (...args) => {
    try { setError(''); await fn(...args); } catch (e) { setError(errMsg(e)); }
  };

  const createTask = wrap(async (form) => { await api.post('/tasks', form); await refresh(); });
  const changeStatus = wrap(async (id, status) => { await api.put(`/tasks/${id}`, { status }); await refresh(); });
  const deleteTask = wrap(async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    await refresh();
  });
  const changeRole = wrap(async (id, role) => { await api.patch(`/users/${id}/role`, { role }); await loadUsers(); });
  const deleteUser = wrap(async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    await Promise.all([loadUsers(), refresh()]);
  });

  const now = new Date();
  const kind = (t) => {
    if (t.status === 'done') return 'done';
    if (t.dueDate && new Date(t.dueDate) < now) return 'missed';
    return t.status === 'in-progress' ? 'live' : 'scheduled';
  };
  const count = (k) => tasks.filter((t) => kind(t) === k).length;

  const visible = tasks.filter((t) =>
    (!filter || t.status === filter) &&
    (!q || `${t.title} ${t.description}`.toLowerCase().includes(q))
  );

  return (
    <>
      <Banner />
      {error && <p className="error">{error}</p>}
      {user.role === 'guest' && <p className="notice">You are in guest mode (read-only). Register for a full account.</p>}

      <div className="stats">
        <div className="card"><b>{count('scheduled')}</b><span>Scheduled</span></div>
        <div className="card"><b>{count('live')}</b><span>Live</span></div>
        <div className="card"><b>{count('missed')}</b><span>Missed</span></div>
        <div className="card"><b>{count('done')}</b><span>Completed</span></div>
      </div>

      {staff && <TaskForm users={users} onSubmit={createTask} />}

      <div className="row between">
        <h3>{staff ? 'All tasks' : 'My tasks'}{q ? ` matching "${q}"` : ''}</h3>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <TaskList tasks={visible} onStatus={changeStatus} onDelete={deleteTask} />

      {isAdmin && <UserManager users={users} onRole={changeRole} onDelete={deleteUser} />}
    </>
  );
}
