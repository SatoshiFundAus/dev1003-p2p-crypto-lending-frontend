

import styles from './LandingPage.module.css';
import Card from './Card';
import Footer from './Footer';
import satoshiFund from '../assets/satoshiFund.png'
import LoginRegister from './LoginRegister';


function LoginRegisterPage() {

    return (
        <>
            <img src={satoshiFund} alt="SatoshiFund Logo" className={styles.logo} />
            <LoginRegister />
            
        </>
    )    
}

export default LoginRegisterPage;
