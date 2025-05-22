import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import BTCPrice from './BitcoinLivePrice';
import Logo from './Logo';

function Header() {
    const navigate = useNavigate()

    return (
        <header className={styles.navbar}>
            <Logo />
            <BTCPrice />
            <button
                className={styles.loginBtn}
                onClick={() => navigate('/login')}
            >
                Login
            </button>
        </header>
    )
}

export default Header