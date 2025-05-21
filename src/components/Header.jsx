import satoshiFund from '../assets/satoshiFund.png';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import BTCPrice from './BitcoinLivePrice';

function Header() {

    const navigate = useNavigate()

    return (
        <header className={styles.navbar}>
            <img src={satoshiFund} alt="Satoshi Fund Logo" className={styles.logo} />
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