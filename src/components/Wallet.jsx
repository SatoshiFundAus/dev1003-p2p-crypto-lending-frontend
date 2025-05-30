import { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import styles from './Wallet.module.css'
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

function Wallet() {
    const navigate = useNavigate();
    const [walletBalance, setWalletBalance] = useState(0)
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [depositWalletModal, setDepositWalletModal] = useState(false);
    const [withdrawWalletModal, setWithdrawWalletModal] = useState(false);

    const [btcPrice, setBtcPrice] = useState(null);
    const [priceLastUpdated, setPriceLastUpdated] = useState(null);



    // Session expiry
    const [sessionExpired, setSessionExpired] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(3);

    const getBTCLivePrice = async () => {
        try {
            const res = await fetch('https://pricing.bitcoin.block.xyz/current-price');

            if (!res.ok) {
                toast.error("Can't fetch BTC Live Price, try again later")
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
                    toast.error("Please login again, you are being redirected")
                    navigate('/login');
                } else {
                    console.log('Wallet data not available (Status:', walletRes.status, ')');

                    if (walletRes.status === 403) {
                        // Session expried - show countdown before redirect
                        setSessionExpired(true);
                        setError('Session expired. Redirecting to login...');
                        localStorage.removeItem('token');

                        // Start countdown
                        let countdown = 3;
                        const countdownInterval = setInterval(() => {
                            countdown--;
                            setRedirectCountdown(countdown);

                            if (countdown <= 0) {
                                clearInterval(countdownInterval);
                                navigate('/login');
                            }
                        }, 1000);

                        return;

                    }

                    toast.info('You need to create a wallet!')

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

    // Creating of a wallet through button click
    const handleCreateClick = async () => {
        try {

            // Get the token for authentication
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error("You are not authenticated, please login again")
                setError('Not authenticated');
                navigate('/login');
                return
            }

            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
                // Note: No body needed since backend gets UserId from token
            });

            if (response.ok) {
                const newWallet = await response.json();
                console.log('Wallet created successfully:', newWallet)
                toast.info('Wallet created successfully ✅')

                setWalletBalance(newWallet.balance || 0);

                setError(null);

            } else if (response.status === 409) {
                // Wallet already exists
                toast.warning('Wallet already exists for this user');

            } else if (response.status === 401) {
                // Unauthorised - token expired
                localStorage.removeItem('token');
                toast.error('Session expired. Please log in again')
                navigate('/login')

            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to create wallet');
            }

        } catch (err) {
            console.error('Create wallet failed:', err);
            setError('An error occured while creating wallet');
        }
    };

    // Deleting of a wallet through button click
    const handleDeleteClick = async () => {
        try {

            // Get token for authentication
            const token = localStorage.getItem('token')

            if (!token) {
                toast.error('Not authenticated, being redirected to login')
                setError('Not authenticated');
                navigate('/login');
                return
            }

            const url = `${BACKEND_URL}/wallets`;


            // Send Response Don't add bearer if token already has it
            const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;


            // Send response
            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                const deleteWallet = await response.json();
                console.log('Wallet deleted successfully');
                toast.info('Wallet deleted successfully')

            } else if (response.status === 409) {
                // Funds in wallet still
                toast.warning('There are still funds in your wallet, withdraw them first')

            } else if (response.status === 404) {
                const responseText = await response.text();
                console.log('404 Response body:', responseText);

                toast.error('Delete wallet functionality is not available on the server');
                console.error('DELETE /wallets endpoint not found (404)');

            } else if (response.status === 401) {
                // Unauthorised - token expired
                localStorage.removeItem('token');
                toast.error('Session expired. Please log in again')
                navigate('/login')

            } else {
                let errorMessage = 'Failed to delete wallet';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;

                } catch (jsonError) {
                    // Response is not JSON
                    console.error('Server returned non-JSON response:', response.status);
                    errorMessage = `Server error (${response.status})`;
                }
                toast.error(errorMessage);
            }

        } catch (err) {

        }
    };

    // Handle deposits with positive values
    const handleDepositSubmit = async (e) => {
        e.preventDefault();
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            toast.error('Please enter a valid deposit amount');
            return;
        }

        setDepositing(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    fundsDeposited: parseFloat(depositAmount)
                })
            });

            if (response.ok) {
                const updatedWallet = await response.json();
                setWalletBalance(updatedWallet.balance);
                setDepositAmount('');
                setDepositWalletModal(false);
                toast.success(`Successfully deposited ₿${depositAmount} to your wallet!`)

            } else if (response.status === 401) {
                localStorage.removeItem('token');
                toast.error('Session expired. Please log in again');
                navigate('/login')

            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to deposit funds');
            }

        } catch (err) {
            console.error('Deposit failed', err);
            toast.error('An error occured while depositing funds');
        } finally {
            setDepositing(false);
        }
    }

    // Handle withdrawals with negative values
    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            toast.error('Please enter a valid withdrawal amount');
            return;
        }

        if (parseFloat(withdrawAmount) > walletBalance) {
            toast.error('Insufficient funds for withdrawal');
            return
        }

        setWithdrawing(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                localStorage.removeItem('token');
                toast.error('You are being redirected back to login');
                navigate('/login');
                return;
            }

            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    fundsDeposited: -parseFloat(withdrawAmount) // Negative value for withdrawal
                })
            });

            if (response.ok) {
                const updatedWallet = await response.json();
                setWalletBalance(updatedWallet.balance);
                setWithdrawAmount('');
                setWithdrawWalletModal(false);
                toast.success(`Successfully withdrew ₿${withdrawAmount} from your wallet!`);

            } else if (response.status === 401) {
                localStorage.removeItem('token');
                toast.error('Session expired. Please log in again');
                navigate('/login');

            } else if (response.status === 400) {
                const errorData = await response.json();

                if (errorData.error && errorData.error.includes('insufficient')) {
                    toast.error('Insufficient funds for withdrawal');

                } else {
                    toast.error(errorData.error || 'Failed to withdraw funds');
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to withdraw funds');
            }

        } catch (err) {
            console.error('Withdrawal failed:', err);
            toast.error('An error occurred while withdrawing funds');

        } finally {
            setWithdrawing(false);
        }
    };

    const closeModals = () => {
        setDepositWalletModal(false);
        setWithdrawWalletModal(false);
        setDepositAmount('');
        setWithdrawAmount('');
    };


    if (loading) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} />
                <div className={styles.loading}>Loading wallet...</div>
            </div>
        )
    }



    if (error) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} />
                <div className={styles.error}>
                    {error}
                    {sessionExpired && (
                        <div style={{ marginTop: '1rem', fontSize: '1.2rem' }}>
                            <i className="fas fa-clock" style={{ marginRight: '0.5rem' }}></i>
                            Redirecting in {redirectCountdown} seconds...
                        </div>
                    )}
                </div>
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
                                ${usdBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                            <button
                                className={`${styles.actionButton} ${styles.secondary}`}
                                onClick={() => setDepositWalletModal(true)}
                            >
                                <i className="fas fa-plus"></i>
                                Deposit
                            </button>
                            <button
                                className={`${styles.actionButton} ${styles.secondary}`}
                                onClick={() => setWithdrawWalletModal(true)}
                            >
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
                            <button
                                className={`${styles.actionButton} ${styles.success}`}
                                onClick={handleCreateClick}
                            >
                                <i className="fa-solid fa-wallet"></i>
                                Create Wallet
                            </button>
                            <button
                                className={`${styles.actionButton} ${styles.danger}`}
                                onClick={handleDeleteClick}
                            >
                                <i className="fa-solid fa-wallet"></i>
                                Delete Wallet
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
                    {/* Deposit Modal */}
                    {depositWalletModal && (
                        <div className={styles.modalOverlay} onClick={closeModals}>
                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h3>Deposit Bitcoin</h3>
                                    <button
                                        className={styles.closeButton}
                                        onClick={closeModals}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <form onSubmit={handleDepositSubmit} className={styles.modalForm}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="depositAmount">Amount (BTC)</label>
                                        <input
                                            type="number"
                                            id="depositAmount"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            placeholder="0.00000000"
                                            step="0.00000001"
                                            min="0"
                                            required
                                            className={styles.amountInput}
                                        />
                                        {depositAmount && (
                                            <div className={styles.usdEquivalent}>
                                                ≈ ${(parseFloat(depositAmount) * currentBtcPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.modalActions}>
                                        <button
                                            type="button"
                                            onClick={closeModals}
                                            className={`${styles.actionButton} ${styles.secondary}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={depositing}
                                            className={`${styles.actionButton} ${styles.success}`}
                                        >
                                            {depositing ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    Depositing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus"></i>
                                                    Deposit
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Withdraw Modal */}
                    {withdrawWalletModal && (
                        <div className={styles.modalOverlay} onClick={closeModals}>
                            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                                <div className={styles.modalHeader}>
                                    <h3>Withdraw Bitcoin</h3>
                                    <button 
                                        className={styles.closeButton}
                                        onClick={closeModals}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                                <form onSubmit={handleWithdrawSubmit} className={styles.modalForm}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="withdrawAmount">Amount (BTC)</label>
                                        <input
                                            type="number"
                                            id="withdrawAmount"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                            placeholder="0.00000000"
                                            step="0.00000001"
                                            min="0"
                                            max={walletBalance}
                                            required
                                            className={styles.amountInput}
                                        />
                                        <div className={styles.balanceInfo}>
                                            Available: ₿{walletBalance.toFixed(8)}
                                        </div>
                                        {withdrawAmount && (
                                            <div className={styles.usdEquivalent}>
                                                ≈ ${(parseFloat(withdrawAmount) * currentBtcPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.modalActions}>
                                        <button
                                            type="button"
                                            onClick={closeModals}
                                            className={`${styles.actionButton} ${styles.secondary}`}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={withdrawing}
                                            className={`${styles.actionButton} ${styles.danger}`}
                                        >
                                            {withdrawing ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                    Withdrawing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-minus"></i>
                                                    Withdraw
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    )

};

export default Wallet;