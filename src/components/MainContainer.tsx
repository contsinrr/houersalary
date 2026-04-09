import type { ReactNode } from 'react';
import '../styles/index.css';

interface MainContainerProps {
  children: ReactNode;
  className?: string;
}

const MainContainer: React.FC<MainContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`main-container ${className}`}>
      {children}
    </div>
  );
};

export default MainContainer;
