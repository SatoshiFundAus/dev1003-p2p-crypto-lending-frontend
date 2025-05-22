import styles from './Logo.module.css';

function Logo() {
    return (
        <div className={styles.logoContainer}>
            <span className={styles.btcSymbol}>₿</span>
            <span className={styles.logoText}>SatoshiFund</span>
        </div>
    );
}

export default Logo; 