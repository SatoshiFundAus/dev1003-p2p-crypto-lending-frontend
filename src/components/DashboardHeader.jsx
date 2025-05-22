import { useNavigate, NavLink } from 'react-router-dom';
import styles from './DashboardHeader.module.css';
import Logo from './Logo';
import { useState } from 'react';

const DashboardHeader = ({ userEmail, isAdmin }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <div style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')} title="Go to Dashboard">
                <Logo />
            </div>
            
            <div className={styles.menuContainer}>
                <button 
                    className={`${styles.menuTrigger} ${isMenuOpen ? styles.menuOpen : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span className={styles.menuText}>Navigate</span>
                    <div className={styles.menuIcon}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
                
                {isMenuOpen && (
                    <nav className={styles.dropdownMenu}>
                        <div className={styles.menuBackground}>
                            {isAdmin && (
                                <NavLink 
                                    to="/admin-dashboard" 
                                    className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <i className="fas fa-user-shield"></i>
                                    <span>Admin Dashboard</span>
                                </NavLink>
                            )}
                            <NavLink 
                                to="/dashboard" 
                                className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-chart-line"></i>
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink 
                                to="/lend" 
                                className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-hand-holding-usd"></i>
                                <span>Lend</span>
                            </NavLink>
                            <NavLink 
                                to="/view-loans" 
                                className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-list-ul"></i>
                                <span>View Loans</span>
                            </NavLink>
                            <NavLink 
                                to="/cryptocurrencies" 
                                className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-coins"></i>
                                <span>Cryptocurrencies</span>
                            </NavLink>
                            <NavLink 
                                to="/request-loan" 
                                className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <i className="fas fa-file-invoice-dollar"></i>
                                <span>Request Loan</span>
                            </NavLink>
                        </div>
                    </nav>
                )}
            </div>

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