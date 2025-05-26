import React from 'react';
import styles from './LoginRegisterPage.module.css';
import LoginRegister from './LoginRegister';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

function LoginRegisterPage(props) {
    const navigate = useNavigate();

    return (
        <section className={styles.pageContainer}>
            {/* Decorative blockchain elements */}
            <div className={styles.blockchainDecor}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.block} style={{ animationDelay: `${i * 0.5}s` }} />
                ))}
            </div>

            <div className={styles.topBar}>
                <Logo />
                <button
                    onClick={() => navigate('/')}
                    aria-label="Cancel and go back"
                    className={styles.closeButton}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            <div className={styles.cardWrapper}>
                <LoginRegister name={props.name} />
            </div>

            {/* Floating crypto symbols */}
            <div className={styles.cryptoSymbols}>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
                <span className={styles.symbol}>₿</span>
            </div>
        </section>
    );
}

export default LoginRegisterPage;
