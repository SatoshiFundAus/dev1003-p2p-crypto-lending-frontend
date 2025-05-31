import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import DashboardHeader from './DashboardHeader';
import { toast } from 'react-toastify';

function Dashboard() {
    const [userEmail, setUserEmail] = useState('')
    const [balance, setBalance] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loanStats, setLoanStats] = useState({
        funded: {
            active: 0,
            repaid: 0,
            defaulted: 0,
            returnRate: 0,
            activeInvested: 0,
            totalInvested: 0
        },
        requested: {
            pending: 0,
            funded: 0,
            expired: 0
        },
        borrowed: {
            openLoans: 0,
            repaidLoans: 0,
            defaultedLoans: 0,
            totalBorrowed: 0,
            monthlyRepayments: 0,
            activeLoansAmount: 0,
            nextPayment: { date: null, amount: 0 }
        },
        wallet: {
            totalFunds: 0
        },
        earningsToDate: 0
    })

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch user data
        const fetchUserData = async () => {
            setLoading(true)
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
                    const lockedCollateral = collateralData
                        .filter(c => c.status === 'locked')
                        .reduce((sum, c) => sum + c.amount, 0);
                    
                    setLoanStats(prev => ({
                        ...prev,
                        wallet: {
                            ...prev.wallet,
                            lockedCollateral
                        }
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

                    // Calculate total amounts for pending and funded loans
                    const pendingAmount = userLoans
                        .filter(loan => loan.status === 'pending')
                        .reduce((sum, loan) => sum + (loan.request_amount || 0), 0);

                    const fundedAmount = userLoans
                        .filter(loan => loan.status === 'funded')
                        .reduce((sum, loan) => sum + (loan.request_amount || 0), 0);

                    setLoanStats(prev => ({
                        ...prev,
                        requested: {
                            pending: pendingLoans,
                            funded: fundedLoans,
                            expired: expiredLoans,
                            pendingAmount,
                            fundedAmount
                        }
                    }));
                }

                // Fetch loan requests where user is borrower and status is funded
                const borrowerDealsResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/borrower-deals', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                if (borrowerDealsResponse.ok) {
                    const borrowerDealsData = await borrowerDealsResponse.json();

                    // Calculate open loans (incomplete deals that haven't expired)
                    const openLoans = borrowerDealsData.filter(deal => {
                        const isNotComplete = !deal.isComplete;
                        const isNotExpired = new Date(deal.expectedCompletionDate) > new Date();
                        return isNotComplete && isNotExpired;
                    }).length;

                    // Calculate active loans amount
                    const activeLoansAmount = borrowerDealsData.reduce((sum, deal) => {
                        const isNotComplete = !deal.isComplete;
                        const isNotExpired = new Date(deal.expectedCompletionDate) > new Date();
                        if (isNotComplete && isNotExpired) {
                            return sum + (deal.loanDetails?.request_amount || 0);
                        }
                        return sum;
                    }, 0);

                    // Calculate total repayments needed for active loans
                    const monthlyRepayments = await Promise.all(borrowerDealsData.map(async (deal) => {
                        if (!deal.isComplete && new Date(deal.expectedCompletionDate) > new Date()) {
                            try {
                                // Fetch interest term details
                                const termResponse = await fetch(`https://dev1003-p2p-crypto-lending-backend.onrender.com/interest-terms/${deal.loanDetails.interest_term}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    credentials: 'include'
                                });

                                if (!termResponse.ok) return 0;
                                const termData = await termResponse.json();
                                const interestRate = termData.interest_rate;
                                const principal = deal.loanDetails?.request_amount || 0;
                                const totalInterest = principal * (interestRate / 100);
                                return principal + totalInterest; // Total amount to repay (principal + interest)
                            } catch {
                                return 0;
                            }
                        }
                        return 0;
                    }));

                    const totalRepayments = monthlyRepayments.reduce((sum, amount) => sum + amount, 0);

                    // Calculate next payment
                    const nextPayment = await (async () => {
                        try {
                            // Fetch user's transactions
                            const transactionsResponse = await fetch(`https://dev1003-p2p-crypto-lending-backend.onrender.com/transactions/user/${tokenData.id}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            });

                            if (!transactionsResponse.ok) return { date: null, amount: 0 };
                            
                            const transactions = await transactionsResponse.json();
                            // Filter for unpaid outgoing transactions (repayments)
                            const unpaidRepayments = transactions.filter(t => 
                                t.fromUser && 
                                String(t.fromUser._id) === String(tokenData.id) && 
                                t.isLoanRepayment && 
                                !t.paymentStatus &&
                                new Date(t.expectedPaymentDate) > new Date()
                            );

                            if (unpaidRepayments.length === 0) return { date: null, amount: 0 };

                            // Find the earliest payment
                            const nextPayment = unpaidRepayments.reduce((next, t) => {
                                const paymentDate = new Date(t.expectedPaymentDate);
                                if (!next.date || paymentDate < next.date) {
                                    return {
                                        date: paymentDate,
                                        amount: t.amount
                                    };
                                }
                                return next;
                            }, { date: null, amount: 0 });

                            return nextPayment;
                        } catch {
                            return { date: null, amount: 0 };
                        }
                    })();

                    // Calculate repaid and defaulted loans
                    const repaidLoans = borrowerDealsData.filter(deal => deal.isComplete).length;
                    const defaultedLoans = borrowerDealsData.filter(deal => {
                        const isNotComplete = !deal.isComplete;
                        const isExpired = new Date(deal.expectedCompletionDate) <= new Date();
                        return isNotComplete && isExpired;
                    }).length;

                    // Calculate total borrowed (sum of all loan amounts)
                    const totalBorrowed = borrowerDealsData.reduce((sum, deal) => {
                        const amount = deal.loanDetails?.request_amount || 0;
                        console.log('Adding to total borrowed:', {
                            dealId: deal._id,
                            amount,
                            status: deal.isComplete ? 'repaid' : 
                                   new Date(deal.expectedCompletionDate) <= new Date() ? 'defaulted' : 'active',
                            currentSum: sum
                        });
                        return sum + amount;
                    }, 0);

                    console.log('Total borrowed breakdown:', {
                        totalBorrowed,
                        activeAmount: activeLoansAmount,
                        repaidAmount: borrowerDealsData.filter(deal => deal.isComplete)
                            .reduce((sum, deal) => sum + (deal.loanDetails?.request_amount || 0), 0),
                        defaultedAmount: borrowerDealsData.filter(deal => {
                            const isNotComplete = !deal.isComplete;
                            const isExpired = new Date(deal.expectedCompletionDate) <= new Date();
                            return isNotComplete && isExpired;
                        }).reduce((sum, deal) => sum + (deal.loanDetails?.request_amount || 0), 0)
                    });

                    setLoanStats(prev => ({
                        ...prev,
                        borrowed: {
                            openLoans,
                            repaidLoans,
                            defaultedLoans,
                            totalBorrowed,
                            activeLoansAmount,
                            monthlyRepayments: totalRepayments,
                            nextPayment
                        }
                    }));
                } else if (borrowerDealsResponse.status === 404) {
                    // No deals found for this borrower
                    setLoanStats(prev => ({
                        ...prev,
                        borrowed: {
                            ...prev.borrowed,
                            openLoans: 0,
                            totalBorrowed: 0,
                            monthlyRepayments: 0
                        }
                    }));
                } else {
                    toast.error('Failed to fetch your borrowed loans data');
                }

                // Fetch deals where user is lender
                const dealsResponse = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/lender-deals', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (dealsResponse.ok) {
                    const dealsData = await dealsResponse.json();
                    
                    // Calculate metrics from the deals data
                    const activeDeals = dealsData.filter(deal => {
                        const isLender = deal.lenderId?.email === tokenData.email;
                        const isNotComplete = !deal.isComplete;
                        const isNotExpired = new Date(deal.expectedCompletionDate) > new Date();
                        return isLender && isNotComplete && isNotExpired;
                    });

                    const active = activeDeals.length;

                    const repaid = dealsData.filter(deal => {
                        const isLender = deal.lenderId?.email === tokenData.email;
                        return isLender && deal.isComplete;
                    }).length;

                    const defaulted = dealsData.filter(deal => {
                        const isLender = deal.lenderId?.email === tokenData.email;
                        const isExpired = new Date(deal.expectedCompletionDate) <= new Date();
                        return isLender && !deal.isComplete && isExpired;
                    }).length;
                    
                    const activeInvested = activeDeals.reduce((sum, deal) => {
                        return sum + (deal.loanDetails?.request_amount || 0);
                    }, 0);

                    // Calculate total lifetime invested (all loans)
                    const totalInvested = dealsData.reduce((sum, deal) => {
                        if (deal.lenderId?.email === tokenData.email) {
                            return sum + (deal.loanDetails?.request_amount || 0);
                        }
                        return sum;
                    }, 0);

                    // Calculate unrealized and realized returns
                    const returns = await Promise.all(dealsData.map(async (deal) => {
                        if (deal.lenderId?.email !== tokenData.email) return { unrealized: 0, realized: 0 };

                        try {
                            // Fetch interest term details
                            const termResponse = await fetch(`https://dev1003-p2p-crypto-lending-backend.onrender.com/interest-terms/${deal.loanDetails.interest_term}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            });

                            if (!termResponse.ok) return { unrealized: 0, realized: 0 };
                            const termData = await termResponse.json();
                            const interestRate = termData.interest_rate;
                            const principal = deal.loanDetails?.request_amount || 0;
                            const totalInterest = principal * (interestRate / 100);

                            // Fetch user's transactions
                            const transactionsResponse = await fetch(`https://dev1003-p2p-crypto-lending-backend.onrender.com/transactions/user/${tokenData.id}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            });

                            let receivedInterest = 0;
                            if (transactionsResponse.ok) {
                                const transactions = await transactionsResponse.json();
                                // Filter transactions for this specific deal and sum up interest payments
                                receivedInterest = transactions.reduce((sum, transaction) => {
                                    if (transaction.dealId === deal._id && 
                                        transaction.type === 'interest' && 
                                        transaction.status === 'completed') {
                                        return sum + transaction.amount;
                                    }
                                    return sum;
                                }, 0);
                            }

                            // Calculate returns based on loan status
                            if (deal.isComplete) {
                                // Repaid loan - all interest is realized
                                return {
                                    unrealized: totalInterest,
                                    realized: receivedInterest
                                };
                            } else if (new Date(deal.expectedCompletionDate) <= new Date()) {
                                // Defaulted loan - only received interest is realized
                                return {
                                    unrealized: totalInterest,
                                    realized: receivedInterest
                                };
                            } else {
                                // Active loan - received interest is realized, rest is unrealized
                                return {
                                    unrealized: totalInterest,
                                    realized: receivedInterest
                                };
                            }
                        } catch {
                            return 0;
                        }
                    }));

                    const totalUnrealizedReturns = returns.reduce((sum, r) => sum + r.unrealized, 0);
                    const totalRealizedReturns = returns.reduce((sum, r) => sum + r.realized, 0);

                    const totalEarned = dealsData.reduce((sum, deal) => {
                        if (deal.lenderId?.email === tokenData.email && deal.isComplete) {
                            const principal = deal.loanDetails?.request_amount || 0;
                            const interestRate = deal.loanDetails?.interest_term?.interest_rate || 0;
                            const interest = principal * (interestRate / 100);
                            return sum + interest;
                        }
                        return sum;
                    }, 0);

                    setLoanStats(prev => ({
                        ...prev,
                        funded: {
                            active,
                            repaid,
                            defaulted,
                            activeInvested,
                            totalInvested,
                            unrealizedReturns: totalUnrealizedReturns,
                            realizedReturns: totalRealizedReturns
                        },
                        earningsToDate: totalEarned
                    }));
                } else if (dealsResponse.status === 404) {
                    // No deals found for this lender
                    setLoanStats(prev => ({
                        ...prev,
                        funded: {
                            ...prev.funded,
                            active: 0,
                            repaid: 0,
                            defaulted: 0,
                            returnRate: 0,
                            collateralValue: 0
                        }
                    }));
                } else {
                    toast.error('Failed to fetch your funded loans data');
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.name === 'TokenExpiredError') {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false)
            }
        };

        fetchUserData();
    }, [navigate])

    if (loading) {
        return (
            <div className={styles.dashboardContainer}>
                <DashboardHeader userEmail={userEmail} />
                <main className={styles.dashboardContent}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <div className={styles.loadingText}>Loading dashboard data...</div>
                    </div>
                </main>
            </div>
        );
    }

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
                                    <span className={styles.metricIcon}>💎</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Active Invested</div>
                                        <div className={styles.metricTitle}>
                                            {(loanStats.funded.activeInvested || 0).toFixed(8)} BTC
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💰</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Total Invested</div>
                                        <div className={styles.metricTitle}>
                                            {(loanStats.funded.totalInvested || 0).toFixed(8)} BTC
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>🎯</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Unrealised Returns</div>
                                        <div className={styles.metricTitle}>
                                            {(loanStats.funded.unrealizedReturns || 0).toFixed(8)} BTC
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>✅</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Realised Returns</div>
                                        <div className={styles.metricTitle}>
                                            {(loanStats.funded.realizedReturns || 0).toFixed(8)} BTC
                                        </div>
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
                                    <div className={styles.statTitle}>Active</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.borrowed.repaidLoans}</div>
                                    <div className={styles.statTitle}>Repaid</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{loanStats.borrowed.defaultedLoans}</div>
                                    <div className={styles.statTitle}>Defaulted</div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💎</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Active Loans</div>
                                        <div className={styles.metricTitle}>{(loanStats.borrowed?.activeLoansAmount || 0).toFixed(8)} BTC</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>💸</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Total Borrowed</div>
                                        <div className={styles.metricTitle}>{(loanStats.borrowed?.totalBorrowed || 0).toFixed(8)} BTC</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📅</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Next Payment</div>
                                        <div className={styles.metricTitle}>
                                            {loanStats.borrowed.nextPayment?.date ? 
                                                `Due in ${Math.ceil((loanStats.borrowed.nextPayment.date - new Date()) / (1000 * 60 * 60 * 24))} days` :
                                                'No upcoming payments'}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>📅</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Repayments</div>
                                        <div className={styles.metricTitle}>{(loanStats.borrowed?.monthlyRepayments || 0).toFixed(8)} BTC</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            className={styles.primaryButton}
                            onClick={() => navigate('/transactions')}
                        >
                            <i className={`${styles.icon} ${styles.iconViewLoans}`}></i>
                            View Transactions
                        </button>
                    </div>

                    {/* Bottom Left - Wallet Funds */}
                    <div className={styles.loanStatsCard}>
                        <h2><i className={`${styles.icon} ${styles.iconWallet}`}></i> Wallet Funds</h2>
                        <div className={styles.statsContainer}>
                            <div className={styles.statsRow}>
                                <div className={`${styles.statBox} ${styles.fullWidthStat}`}>
                                    <div className={styles.statNumber}>{balance !== null ? (balance + (loanStats.wallet?.lockedCollateral || 0)).toFixed(8) : 'Loading...'} BTC</div>
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
                                        <div className={styles.metricTitle}>{(loanStats.wallet?.lockedCollateral || 0).toFixed(8)} BTC</div>
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
                            <div className={styles.metricsRow}>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>⏳</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Pending Loans</div>
                                        <div className={styles.metricTitle}>{(loanStats.requested?.pendingAmount || 0).toFixed(8)} BTC</div>
                                    </div>
                                </div>
                                <div className={styles.metricBox}>
                                    <span className={styles.metricIcon}>✅</span>
                                    <div className={styles.metricContent}>
                                        <div className={styles.metricNumber}>Funded Loans</div>
                                        <div className={styles.metricTitle}>{(loanStats.requested?.fundedAmount || 0).toFixed(8)} BTC</div>
                                    </div>
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