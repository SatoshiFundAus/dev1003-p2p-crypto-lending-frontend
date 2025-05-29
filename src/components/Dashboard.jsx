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
        borrowed: {
            openLoans: 0,
            totalBorrowed: 0,
            monthlyRepayments: 0
        },
        wallet: {
            totalFunds: 0
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
        <div className={styles.dashboardContainer}>
            <DashboardHeader userEmail={userEmail} />
            <main className={styles.dashboardContent}>
                <div className={styles.dashboardGrid}>
                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconFundedLoans}`}></i> Loans Funded</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.funded.active}</div>
                                    <div className={styles.statTitle}>Active</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.funded.repaid}</div>
                                    <div className={styles.statTitle}>Repaid</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.funded.defaulted}</div>
                                    <div className={styles.statTitle}>Defaulted</div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💰</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>{loanStats.funded.returnRate}%</div>
                                        <div className={styles.metricTitle}>APY Return Rate</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📈</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>{loanStats.earningsToDate.toFixed(8)} BTC</div>
                                        <div className={styles.metricTitle}>Lifetime Earnings</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={`${styles.primaryButton} ${styles.fundButton}`}
                            onClick={() => navigate('/view-loans')}
                        >
                            <i className={`${styles.icon} ${styles.iconAddFund}`}></i>
                            Fund a Loan
                        </button>
                    </div>

                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconBorrowedLoans}`}></i> Loans Borrowed</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.borrowed.openLoans}</div>
                                    <div className={styles.statTitle}>Open Loans</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.borrowed.totalBorrowed.toFixed(8)}</div>
                                    <div className={styles.statTitle}>Total Borrowed</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.borrowed.monthlyRepayments.toFixed(8)}</div>
                                    <div className={styles.statTitle}>Monthly Repayments</div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📅</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Next Payment</div>
                                        <div className={styles.metricTitle}>Due in 5 days</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📊</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Interest Rate</div>
                                        <div className={styles.metricTitle}>5% APY</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={styles.primaryButton}
                            onClick={() => navigate('/my-loans')}
                        >
                            <i className={`${styles.icon} ${styles.iconViewLoans}`}></i>
                            View My Loans
                        </button>
                    </div>

                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconWallet}`}></i> Wallet Funds</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={`${styles.statBox} ${styles.fullWidthStat}`}>
                                    <div className={styles.statNumber}>{loanStats.wallet.totalFunds.toFixed(8)}</div>
                                    <div className={styles.statTitle}>Total Balance</div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💸</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Available</div>
                                        <div className={styles.metricTitle}>{loanStats.wallet.totalFunds.toFixed(8)} BTC</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>🔒</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Locked</div>
                                        <div className={styles.metricTitle}>{loanStats.funded.collateralValue} BTC</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={styles.primaryButton}
                            onClick={() => navigate('/wallet')}
                        >
                            <i className={`${styles.icon} ${styles.iconDeposit}`}></i>
                            Manage Wallet
                        </button>
                    </div>

                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconRequestedLoans}`}></i> Loans Requested</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.requested.pending}</div>
                                    <div className={styles.statTitle}>Pending</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.requested.funded}</div>
                                    <div className={styles.statTitle}>Funded</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.requested.expired}</div>
                                    <div className={styles.statTitle}>Expired</div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={`${styles.primaryButton} ${styles.requestButton}`}
                            onClick={() => navigate('/request-loan')}
                        >
                            <i className={`${styles.icon} ${styles.iconSendRequest}`}></i>
                            Request a Loan
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
