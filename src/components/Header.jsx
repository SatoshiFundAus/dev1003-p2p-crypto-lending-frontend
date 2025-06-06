import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import BTCPrice from './BitcoinLivePrice';
import Logo from './Logo';

function Header() {
    const navigate = useNavigate()

    return (
        <header className={styles.navbar}>
            <div className={styles.navbarLeft}>
                <Logo />
            </div>
            <div className={styles.navbarCenter}>
                <BTCPrice />
            </div>
            <div className={styles.navbarRight}>
                <button
                    className={styles.loginBtn}
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
            </div>
        </header>
    )
}

export default Header