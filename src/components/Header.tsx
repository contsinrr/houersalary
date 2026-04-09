import type { ReactNode } from 'react';
import '../styles/index.css';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showHelp?: boolean;
  onHelp?: () => void;
  onFillExample?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title = '打工人时薪测算',
  showBack = false,
  onBack,
  showHelp = false,
  onHelp,
  onFillExample
}) => {
  return (
    <header className="header">
      <div className="header-content">
        {showBack && (
          <button className="header-back-btn" onClick={onBack}>
            ← 返回
          </button>
        )}
        <h1 className="header-title">{title}</h1>
        <div className="header-actions">
          {onFillExample && (
            <button className="btn btn-secondary btn-sm" onClick={onFillExample}>
              {'📋'} 示例数据
            </button>
          )}
          {onHelp && (
            <button className="btn btn-secondary btn-sm" onClick={onHelp}>
              {'💡'} 使用说明
            </button>
          )}
          <span className="header-version">v1.0.0</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
