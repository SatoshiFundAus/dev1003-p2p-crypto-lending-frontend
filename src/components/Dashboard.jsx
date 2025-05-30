import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import DashboardHeader from './DashboardHeader';
import { toast } from 'react-toastify';

function Dashboard() {
    const [userEmail, setUserEmail] = useState('');
    const [balance, setBalance] = useState(null);
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
        earningsToDate: 0.05 
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
                    
                    // Calculate total locked collateral
                    const totalCollateral = collateralData
                        .filter(c => c.status === 'locked')
                        .reduce((sum, c) => sum + c.amount, 0);
                    
                    setLoanStats(prev => ({
                        ...prev,
                        collateralHeld: totalCollateral
                    }));
                }

                // Fetch loan data
                const loansResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/loan-requests', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (loansResponse.ok) {
                    const loansData = await loansResponse.json();
                    const userLoans = loansData.filter(loan => loan.borrower_id && String(loan.borrower_id._id) === String(tokenData.id));
                    const pendingLoans = userLoans.filter(loan => loan.status === 'pending').length;
                    const fundedLoans = userLoans.filter(loan => loan.status === 'funded').length;
                    const expiredLoans = userLoans.filter(loan => loan.status === 'expired').length;

                    setLoanStats(prev => ({
                        ...prev,
                        requested: {
                            pending: pendingLoans,
                            funded: fundedLoans,
                            expired: expiredLoans
                        }
                    }));
                }

                // Fetch loan requests where user is borrower and status is funded
                const loanRequestsResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/loan-requests', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (loanRequestsResponse.ok) {
                    const loanRequestsData = await loanRequestsResponse.json();
                    const borrowedLoans = loanRequestsData.filter(loan => {
                        return (
                            String(loan.borrower_id) === String(tokenData.id) &&
                            loan.status === 'funded'
                        );
                    });
                    const openLoans = borrowedLoans.length;
                    const totalBorrowed = borrowedLoans.reduce((sum, loan) => sum + (loan.request_amount || 0), 0);
                    setLoanStats(prev => ({
                        ...prev,
                        borrowed: {
                            ...prev.borrowed,
                            openLoans,
                            totalBorrowed,
                            monthlyRepayments: 0
                        }
                    }));
                }

                // Fetch deals where user is lender
                const dealsResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/user-deals', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (dealsResponse.ok) {
                    const dealsData = await dealsResponse.json();
                    dealsData.forEach(deal => {
                        console.log('Deal lenderId:', deal.lenderId);
                    });
                    // Filter for deals where the logged-in user is the lender (by email)
                    const fundedDeals = dealsData.filter(deal => deal.lenderId && deal.lenderId.email === tokenData.email);
                    const active = fundedDeals.filter(deal => deal.isComplete === false).length;
                    const repaid = fundedDeals.filter(deal => deal.isComplete === true).length;
                    // Defaulted, returnRate, collateralValue: set to 0 for now
                    setLoanStats(prev => ({
                        ...prev,
                        funded: {
                            ...prev.funded,
                            active,
                            repaid,
                            defaulted: 0,
                            returnRate: 0,
                            collateralValue: 0
                        }
                    }));

                } else if (dealsResponse.status === 404) {
                    // Add that deals don't yet exist for this user.
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
    }, [navigate])

    return (
        <div className={styles.dashboardContainer}>
            <DashboardHeader userEmail={userEmail} />
            <main className={styles.dashboardContent}>
                <div className={styles.dashboardGrid}>
                    {/* Top Left - Loans Funded */}
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
                                        <div className={styles.metricNumber}>Return Rate</div>
                                        <div className={styles.metricTitle}>{loanStats.funded.returnRate}%</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📈</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Total Earnings</div>
                                        <div className={styles.metricTitle}>{loanStats.earningsToDate.toFixed(8)} BTC</div>
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

                    {/* Top Right - Loans Borrowed */}
                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconBorrowedLoans}`}></i> Loans Borrowed</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.borrowed.openLoans}</div>
                                    <div className={styles.statTitle}>Open Loans</div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💸</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Total Borrowed</div>
                                        <div className={styles.metricTitle}>{loanStats.borrowed.totalBorrowed.toFixed(8)} BTC</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📅</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Repayments</div>
                                        <div className={styles.metricTitle}>{loanStats.borrowed.monthlyRepayments.toFixed(8)} BTC</div>
                                    </div>
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

                    {/* Bottom Left - Wallet Funds */}
                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconWallet}`}></i> Wallet Funds</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={`${styles.statBox} ${styles.fullWidthStat}`}>
                                    <div className={styles.statNumber}>{balance !== null ? (balance + loanStats.funded.collateralValue).toFixed(8) : 'Loading...'} BTC</div>
                                    <div className={styles.statTitle}>Total Balance</div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💸</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Available</div>
                                        <div className={styles.metricTitle}>{balance !== null ? balance.toFixed(8) : 'Loading...'} BTC</div>
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

                    {/* Bottom Right - Loans Requested */}
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