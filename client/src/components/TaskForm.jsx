import { useState } from 'react';

const empty = { title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' };

export default function TaskForm({ users, onSubmit }) {
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(empty);
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>Create task</h3>
      <input placeholder="Title" value={form.title} onChange={set('title')} required />
      <textarea placeholder="Description" value={form.description} onChange={set('description')} />
      <div className="row">
        <select value={form.priority} onChange={set('priority')}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" value={form.dueDate} onChange={set('dueDate')} />
        <select value={form.assignedTo} onChange={set('assignedTo')}>
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
          ))}
        </select>
      </div>
      <button className="btn">Add task</button>
    </form>
  );
}
