export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-side">
        <div className="brand">
          <img src="/logo.svg" alt="" />
          <span>TaskFlow</span>
        </div>
        <h2>Organise work.<br />Ship faster.</h2>
        <p>Assign tasks, track progress and manage your team with role-based access.</p>
        <img className="side-art" src="/hero.svg" alt="Task board illustration" />
        <ul>
          <li>✅ Admin, manager and member roles</li>
          <li>📋 Track tasks from to-do to done</li>
          <li>🔒 Secure JWT authentication</li>
        </ul>
        <p className="side-contact">✉️ Contact: akashdeepsingh.7062@gmail.com</p>
      </aside>
      <main className="auth-main">{children}</main>
    </div>
  );
}
