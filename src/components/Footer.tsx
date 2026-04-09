import type { ReactNode } from 'react';
import '../styles/index.css';

interface FooterProps {
  copyright?: string;
}

const Footer: React.FC<FooterProps> = ({ copyright = '© 2026 打工人时薪测算' }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">{copyright}</p>
      </div>
    </footer>
  );
};

export default Footer;
