import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import DashboardHeader from './DashboardHeader';

function Dashboard() {
    const [userEmail, setUserEmail] = useState('');
    const [balance, setBalance] = useState(null);
    const [collateral, setCollateral] = useState([]);
    const [loanStats, setLoanStats] = useState({
        funded: {
            active: 0,
            repaid: 0,
            defaulted: 0,
            returnRate: 0,
            collateralValue: 0
        },
        requested: {
            pending: 0,
            funded: 0,
            expired: 0
        },
        earningsToDate: 0.05 // Example value
    });

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
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(tokenData.email);

                // Fetch wallet balance
                const balanceResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/wallet-balance', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (balanceResponse.ok) {
                    const balanceData = await balanceResponse.json();
                    if (balanceData.walletBalance !== undefined) {
                        setBalance(balanceData.walletBalance);
                    } else {
                        // Create wallet if none exists
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
                } else if (balanceResponse.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }

                // Fetch user's collateral
                const collateralResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/collateral', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (collateralResponse.ok) {
                    const collateralData = await collateralResponse.json();
                    setCollateral(collateralData);
                    
                    // Calculate total locked collateral
                    const totalCollateral = collateralData
                        .filter(c => c.status === 'locked')
                        .reduce((sum, c) => sum + c.amount, 0);
                    
                    setLoanStats(prev => ({
                        ...prev,
                        collateralHeld: totalCollateral
                    }));
                }

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
            <DashboardHeader userEmail={userEmail} />
            <main className={styles.mainContent}>
                <div className={styles.statsSection}>
                    <div className={styles.loanCard}>
                        <h2><i className="fas fa-handshake"></i> Loans Funded</h2>
                        <div className={styles.loanStats}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{loanStats.funded.active}</div>
                                    <div className={styles.statLabel}>Active</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{loanStats.funded.repaid}</div>
                                    <div className={styles.statLabel}>Repaid</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{loanStats.funded.defaulted}</div>
                                    <div className={styles.statLabel}>Defaulted</div>
                                </div>
                            </div>
                            <div className={styles.metricsGrid}>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricIcon}>💰</span>
                                    <div className={styles.metricInfo}>
                                        <div className={styles.metricValue}>{loanStats.funded.returnRate}%</div>
                                        <div className={styles.metricLabel}>APY Return Rate</div>
                                    </div>
                                </div>
                                <div className={styles.metricItem}>
                                    <span className={styles.metricIcon}>🔒</span>
                                    <div className={styles.metricInfo}>
                                        <div className={styles.metricValue}>{loanStats.funded.collateralValue} BTC</div>
                                        <div className={styles.metricLabel}>Collateral Value</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={`${styles.actionButton} ${styles.fundLoan}`}
                            onClick={() => navigate('/view-loans')}
                        >
                            <i className="fas fa-plus-circle"></i>
                            Fund a Loan
                        </button>
                    </div>

                    <div className={styles.loanCard}>
                        <h2><i className="fas fa-hand-holding-usd"></i> Loans Requested</h2>
                        <div className={styles.loanStats}>
                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{loanStats.requested.pending}</div>
                                    <div className={styles.statLabel}>Pending</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{loanStats.requested.funded}</div>
                                    <div className={styles.statLabel}>Funded</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{loanStats.requested.expired}</div>
                                    <div className={styles.statLabel}>Expired</div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={`${styles.actionButton} ${styles.requestLoan}`}
                            onClick={() => navigate('/request-loan')}
                        >
                            <i className="fas fa-paper-plane"></i>
                            Request a Loan
                        </button>
                    </div>
                </div>

                <div className={styles.collateralSection}>
                    <h2>Current Collateral Held</h2>
                    <div className={styles.btcAmount}>
                        ≈ {loanStats.collateralHeld || 0} BTC
                    </div>

                    <h2>Earnings to Date</h2>
                    <div className={styles.btcAmount}>
                        ≈ {loanStats.earningsToDate} BTC
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
