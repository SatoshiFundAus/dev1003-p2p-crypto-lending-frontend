import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import Logo from './Logo';

function Dashboard() {
    const [userEmail, setUserEmail] = useState('');
    const [balance, setBalance] = useState(null);
    const [loans, setLoans] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch user data
        const fetchUserData = async () => {
            try {
                // First, get the user's email from the token
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(tokenData.email);

                // Then fetch user's wallet balance
                const response = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/wallet-balance', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.walletBalance !== undefined) {
                        setBalance(data.walletBalance);
                    } else {
                        // If no wallet exists, create one
                        const createWalletResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/wallets', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });
                        
                        if (createWalletResponse.ok) {
                            const newWalletData = await createWalletResponse.json();
                            setBalance(newWalletData.balance);
                        }
                    }
                } else if (response.status === 404) {
                    // If wallet not found, create one
                    const createWalletResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/wallets', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });
                    
                    if (createWalletResponse.ok) {
                        const newWalletData = await createWalletResponse.json();
                        setBalance(newWalletData.balance);
                    }
                } else if (response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    console.error('Failed to fetch wallet data:', response.status);
                }

                // Fetch deals/loans (if you have an endpoint for this)
                // TODO: Add deals/loans endpoint integration when available

            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.name === 'TokenExpiredError') {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <Logo />
                <div className={styles.userInfo}>
                    <div className={styles.userEmail}>{userEmail}</div>
                    <div className={styles.userAvatar} onClick={handleLogout} title="Click to logout">
                        <i className="fas fa-user-circle"></i>
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <div className={styles.balanceSection}>
                    <h2>Balance</h2>
                    <div className={styles.balanceAmount}>
                        {balance !== null ? `${balance} BTC` : 'Loading...'}
                    </div>
                </div>

                <div className={styles.loansSection}>
                    <h2>Loans</h2>
                    <div className={styles.loansList}>
                        {loans.length > 0 ? (
                            loans.map((loan, index) => (
                                <div key={index} className={styles.loanItem}>
                                    <span>{loan.amount} BTC</span>
                                    <span>{loan.status}</span>
                                </div>
                            ))
                        ) : (
                            <div className={styles.noLoans}>No active loans</div>
                        )}
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button 
                        className={`${styles.actionButton} ${styles.requestLoan}`}
                        onClick={() => navigate('/request-loan')}
                    >
                        Request Loan
                    </button>
                    <button 
                        className={`${styles.actionButton} ${styles.fundLoan}`}
                        onClick={() => navigate('/fund-loan')}
                    >
                        Fund Loan
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
