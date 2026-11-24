const CONTACT = {
  name: 'Akashdeep Singh',
  email: 'akashdeepsingh.7062@gmail.com',
  github: 'https://github.com/akashdeepsingh7062',
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>TaskFlow</h4>
          <p>A full stack MERN task management app with role-based access.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>✉️ <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
          <p>🐙 <a href={CONTACT.github} target="_blank" rel="noreferrer">GitHub profile</a></p>
        </div>
      </div>
      <p className="copy">©️ {new Date().getFullYear()} {CONTACT.name}. All rights reserved.</p>
    </footer>
  );
}
