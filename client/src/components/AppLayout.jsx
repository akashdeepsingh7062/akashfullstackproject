import { useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const search = (e) => {
    e.preventDefault();
    const q = String(new FormData(e.target).get('q') || '').trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  return (
    <div className="shell">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)}>☰</button>
          <form className="search" onSubmit={search}>
            <input name="q" key={params.get('q') || ''} defaultValue={params.get('q') || ''} placeholder="🔍 Search tasks and press Enter" />
          </form>
        </header>
        <div className="content"><Outlet /></div>
        <Footer />
      </div>
    </div>
  );
}
