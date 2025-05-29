import { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import styles from './Wallet.module.css'
import { Navigate, useNavigate } from "react-router-dom";

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

function Wallet() {
    const navigate = useNavigate();
    const [walletBalance, setWalletBalance] = useState(0)
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [btcPrice, setBtcPrice] = useState(null);
    const [priceLastUpdated, setPriceLastUpdated] = useState(null);

    const getBTCLivePrice = async () => {
        try {
            const res = await fetch('https://pricing.bitcoin.block.xyz/current-price');

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()
            const formattedDate = new Date(
                data.last_updated_at_in_utc_epoch_seconds * 1000
            ).toLocaleString();

            setBtcPrice(data.amount);
            setPriceLastUpdated(formattedDate)

        } catch (err) {
            console.error('Error fetching Bitcoin price:', err);
            setBtcPrice(100000); //Fallback price
        }
    };


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(tokenData.email)
            } catch (err) {
                console.error('Error parsing token:', err);
                setUserEmail('')
            }
        }
    }, []);

    // BTC price fetching
    useEffect(() => {
        getBTCLivePrice();
        const interval = setInterval(getBTCLivePrice, 60000);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        // Access API to get User's wallet balance
        const fetchWalletData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get stored user data
                const token = localStorage.getItem('token');

                if (!token) {
                    console.log('Not authenticated', { token: !!token });
                    navigate('/login');
                    return;
                }

                // Debug token information
                console.log('Token exists:', !!token);
                console.log('Token length:', token ? token.length : 0);
                try {
                    const tokenData = JSON.parse(atob(token.split('.')[1]));
                    console.log('Token payload:', tokenData);
                    console.log('Token expiry:', new Date(tokenData.exp * 1000));
                } catch (err) {
                    console.error('Error parsing token for debug:', err);
                }

                // Common headers for all requests
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }

                const walletRes = await fetch(BACKEND_URL + '/wallet-balance', {
                    headers,
                    credentials: 'include'
                });

                if (walletRes.ok) {
                    const incomingWalletData = await walletRes.json();
                    console.log('Wallet data fetched:', incomingWalletData)

                    setWalletBalance(incomingWalletData.walletBalance || 0);
                } else if (walletRes.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    console.log('Wallet data not available (Status:', walletRes.status, ')');
                    setError('Failed to fetch wallet data');
                }

            } catch (err) {
                console.error('An error has occured:', err)
                setError('An error occured while fetching user data')
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading wallet...</div>
            </div>
        )
    }


    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    const currentBtcPrice = btcPrice || 100000; // Fallback to 100,000
    const usdBalance = walletBalance * currentBtcPrice;

    return (
        // Header section
        <div className={styles.container}>
            <DashboardHeader userEmail={userEmail} />
            <main className={styles.main}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Your Wallet</h1>

                    {/* Main Wallet Balance Card */}
                    <div className={styles.walletGrid}>
                        <div className={styles.balanceCard}>
                            <div className={styles.balanceHeader}>
                                <i className="fab fa-bitcoin"></i>
                                Bitcoin Balance
                            </div>
                            <div className={styles.balanceAmount}>
                                ₿ {walletBalance.toFixed(8)}
                            </div>
                            <div className={styles.balanceUsd}>
                                ≈ ${usdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                            </div>
                            {priceLastUpdated && (
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem' }}>
                                    Price updated: {priceLastUpdated}
                                </div>
                            )}
                        </div>

                        <div className={styles.portfolioCard}>
                            <h3>Portfolio Value</h3>
                            <div className={styles.portfolioValue}>
                            ${usdBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </div>
                            <div className={styles.portfolioChange + ' ' + styles.positive}>
                                +2.5% (24h)
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className={styles.quickStats}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>0</div>
                            <div className={styles.statLabel}>Active Loans</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>12</div>
                            <div className={styles.statLabel}>Transactions</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>0.00</div>
                            <div className={styles.statLabel}>Locked Funds</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue}>5.2%</div>
                            <div className={styles.statLabel}>Avg Return</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionsContainer}>
                        <h2>Quick Actions</h2>
                        <div className={styles.actions}>
                            <button className={`${styles.actionButton} ${styles.primary}`}>
                                <i className="fas fa-plus"></i>
                                Deposit
                            </button>
                            <button className={`${styles.actionButton} ${styles.secondary}`}>
                                <i className="fas fa-minus"></i>
                                Withdraw
                            </button>
                            <button
                                className={styles.actionButton}
                                onClick={() => navigate('/request-loan')}
                            >
                                <i className="fas fa-hand-holding-usd"></i>
                                Request Loan
                            </button>
                            <button
                                className={styles.actionButton}
                                onClick={() => navigate('/view-loans')}
                            >
                                <i className="fas fa-search"></i>
                                Browse Loans
                            </button>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className={styles.transactionContainer}>
                        <h2>Recent Transactions</h2>
                        <div className={styles.transactionList}>
                            <div className={styles.transactionItem}>
                                <div className={styles.transactionInfo}>
                                    <div className={styles.transactionType}>Initial Deposit</div>
                                    <div className={styles.transactionDate}>2024-01-15</div>
                                </div>
                                <div className={`${styles.transactionAmount} ${styles.positive}`}>
                                    +{walletBalance.toFixed(8)} BTC
                                </div>
                            </div>
                            <div className={styles.transactionItem}>
                                <div className={styles.transactionInfo}>
                                    <div className={styles.transactionType}>Loan Interest</div>
                                    <div className={styles.transactionDate}>2024-01-10</div>
                                </div>
                                <div className={`${styles.transactionAmount} ${styles.positive}`}>
                                    +0.00125000 BTC
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )

};

export default Wallet;