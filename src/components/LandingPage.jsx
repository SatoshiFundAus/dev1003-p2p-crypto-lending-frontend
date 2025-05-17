import styles from './LandingPage.module.css';
import Card from './Card';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import Header from './Header';


function LandingPage() {

    const navigate = useNavigate()

    const cardDescription1 =
        `Sign in securely. No banks. No third parties`;

    const cardDescription2 =
        `Borrowers submit loan requests. Lenders review 
        and fund directly`;

    const cardDescription3 =
        `Repayment and interest are enforced via blockchain 
        technology`;

    return (
        <>
            <div className={styles.landingPage}>
                <Header />
                {/* <header className={styles.navbar}>
                    <img src={satoshiFund} alt="Satoshi Fund Logo" className={styles.logo} />
                    <BTCPrice />
                    <button
                        className={styles.loginBtn}
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                </header> */}

                <main className={styles.mainContent}>
                    <div className={styles.heroText}>
                        <h1>Borrow or Lend Bitcoin Securely. Instantly.</h1>
                        <p>A decentralized peer-to-peer platform empowering users to lend or borrow Bitcoin without banks</p>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button className={`${styles.btn} ${styles.primary}`}>Borrow BTC</button>
                        <button className={`${styles.btn} ${styles.primary}`}>Lend BTC</button>
                    </div>

                    <div className={styles.instructions}>
                        <Card className={styles.instructionSteps} cardName={"Step 1. Register an Account"} description={cardDescription1} />
                        <Card className={styles.instructionSteps} cardName={"Step 2. Choose a Loan"} description={cardDescription2} />
                        <Card className={styles.instructionSteps} cardName={"Step 3. Get Started"} description={cardDescription3} />
                    </div>
                </main>

            </div>
            <Footer />
        </>
    )
}

export default LandingPage;
