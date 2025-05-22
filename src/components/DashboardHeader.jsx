import { useNavigate } from 'react-router-dom';
import styles from './DashboardHeader.module.css';
import Logo from './Logo';

const DashboardHeader = ({ userEmail }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <Logo />
            <div className={styles.userInfo}>
                <div className={styles.userEmail}>{userEmail}</div>
                <div className={styles.userAvatar} onClick={handleLogout} title="Click to logout">
                    <i className="fas fa-user-circle"></i>
                </div>
            </div>
        </header>
    );
};

// Add a display name for better debugging
DashboardHeader.displayName = 'DashboardHeader';

// Use a more explicit export
export { DashboardHeader as default }; 