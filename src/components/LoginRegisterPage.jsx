

import styles from './LoginRegisterPage.module.css';
import Card from './Card';
import Footer from './Footer';
import satoshiFund from '../assets/satoshiFund.png'
import LoginRegister from './LoginRegister';
import { useNavigate } from 'react-router-dom';


function LoginRegisterPage() {

    const navigate = useNavigate()
    const CloseIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>

    );
    return (
        <section className={styles.pageContainer}>
            <img src={satoshiFund} alt="SatoshiFund Logo" className={styles.logo} />
            <button
                onClick={() => navigate('/')}
                aria-label="Cancel and go back"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
                <CloseIcon />
            </button>

            <div className={styles.cardWrapper}>
                <LoginRegister />
            </div>


        </section>
    )
}

export default LoginRegisterPage;
