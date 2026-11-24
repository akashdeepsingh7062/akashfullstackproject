import { useAuth } from '../context/AuthContext';

export default function Banner() {
  const { user } = useAuth();
  return (
    <section className="banner">
      <div>
        <h2>Welcome back, {user.name}! 👋</h2>
        <p>Plan, assign and track your team's work in one place.</p>
      </div>
      <img src="/hero.svg" alt="Task board illustration" />
    </section>
  );
}
