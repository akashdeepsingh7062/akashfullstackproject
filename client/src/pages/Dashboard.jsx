import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import UserManager from '../components/UserManager';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const canManage = user.role !== 'member';

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks', { params: filter ? { status: filter } : {} });
      setTasks(data);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [filter]);

  const loadUsers = useCallback(async () => {
    if (!canManage) return;
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (e) {
      setError(errMsg(e));
    }
  }, [canManage]);

  useEffect(() => { loadTasks(); }, [loadTasks]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const wrap = (fn) => async (...args) => {
    try { setError(''); await fn(...args); } catch (e) { setError(errMsg(e)); }
  };

  const createTask = wrap(async (form) => {
    await api.post('/tasks', form);
    await loadTasks();
  });
  const changeStatus = wrap(async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    await loadTasks();
  });
  const deleteTask = wrap(async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    await loadTasks();
  });
  const changeRole = wrap(async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    await loadUsers();
  });
  const deleteUser = wrap(async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/users/${id}`);
    await Promise.all([loadUsers(), loadTasks()]);
  });

  const count = (s) => tasks.filter((t) => t.status === s).length;

  return (
    <>
      <Navbar />
      <main className="container">
        {error && <p className="error">{error}</p>}

        <div className="stats">
          <div className="card"><b>{tasks.length}</b><span>Shown</span></div>
          <div className="card"><b>{count('todo')}</b><span>To do</span></div>
          <div className="card"><b>{count('in-progress')}</b><span>In progress</span></div>
          <div className="card"><b>{count('done')}</b><span>Done</span></div>
        </div>

        {canManage && <TaskForm users={users} onSubmit={createTask} />}

        <div className="row between">
          <h3>{canManage ? 'All tasks' : 'My tasks'}</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <TaskList tasks={tasks} onStatus={changeStatus} onDelete={deleteTask} />

        {isAdmin && <UserManager users={users} onRole={changeRole} onDelete={deleteUser} />}
      </main>
    </>
  );
}
