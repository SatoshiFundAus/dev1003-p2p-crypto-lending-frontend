import { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import styles from './Wallet.module.css'
import loadingStyles from './Loading.module.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "./Footer";

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

function Wallet() {
    const navigate = useNavigate();
    const [walletBalance, setWalletBalance] = useState(0)
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [depositWalletModal, setDepositWalletModal] = useState(false);
    const [withdrawWalletModal, setWithdrawWalletModal] = useState(false);
    const [transactions, setTransactions] = useState([])
    const [transactionsLoading, setTransactionsLoading] = useState(false)

    const [btcPrice, setBtcPrice] = useState(null);
    const [priceLastUpdated, setPriceLastUpdated] = useState(null);



    // Session expiry
    const [sessionExpired, setSessionExpired] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(3);


    //Updated userId whenever userId changes
    useEffect(() => {
        console.log('UserId state updated to:', userId);
        console.log('UserId type:', typeof userId);
        if (typeof userId === 'object') {
            console.log('UserId object contents:', userId);
        }
    }, [userId]); // This runs whenever userId changes


    // Creating a seperate authenticated helper function to keep the code DRY
    const getAuthenticatedRequest = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('Not authenticated');
            localStorage.removeItem('token');
            toast.error("You are being redirected to the login page")
            navigate('/login');
            throw new Error("No authentication token")
        }

        let tokenData;
        let extractedUserId;
        try {
            tokenData = JSON.parse(atob(token.split('.')[1]));
            console.log('tokenData.id directly:', tokenData.id)

            extractedUserId = tokenData.id

            if (!userEmail && tokenData.email) {
                setUserEmail(tokenData.email)
            }

            if (!userId && tokenData.id) {
                setUserId(tokenData.id)
            }

        } catch (err) {
            console.log("Error parsing token: ", err);
            localStorage.removeItem('token');
            toast.error("You are being redirected to the login page");
            navigate('/login');
            throw new Error("Invalid token format");
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };


        return { token, tokenData, headers, userId: extractedUserId };

    }

    // Get BTC Live price for working out portfolio balance
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

                // Check if authorised first
                const { headers } = await getAuthenticatedRequest();


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
                } else if (walletRes.status === 404) {
                    toast.info("You don't currently have a wallet, please create one.")
                    setWalletBalance(0);
                } else if (walletRes.status === 403) {
                    // Session expired - show countdown before redirect
                    setSessionExpired(true);
                    setError('Session expired. Redirecting to login...');
                    localStorage.removeItem('token');

                    if (walletRes.status === 403) {
                        // Session expired - show countdown before redirect
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

                    } else {
                        console.log('Wallet data not available (Status:', walletRes.status, ')');
                        // For other unexpected errors, just set balance to 0 
                        setWalletBalance(0);
                        toast.info('Unable to load wallet data. Please try refreshing the page.');
                    }



                }

            } catch (err) {
                console.error('An error has occurred:', err)
                setError('An error occurred while fetching user data')
            } finally {
                setLoading(false);
            }
        };

        const fetchOtherData = async () => {
            try {

                setLoading(true);
                setError(null)

                const { headers, userId: currentUserId } = await getAuthenticatedRequest();

                // Fetching Borrower Deals
                const borrowerRes = await fetch(BACKEND_URL + '/borrower-deals', {
                    headers,
                    credentials: 'include'
                });

                if (borrowerRes.ok) {
                    const incomingBorrowerData = await borrowerRes.json();
                    console.log("Borrowed loans data fetched:", incomingBorrowerData)

                } else if (borrowerRes.status === 404) {
                    // Check if its a proper JSON response (no data) or HTML response (route not found)
                    const contentType = borrowerRes.headers.get('content-type')

                    if (contentType && contentType.includes('application/json')) {
                        console.info('No borrower deals found for this user');
                        const errorData = await borrowerRes.json();
                        console.log('404 Response:', errorData)

                    } else {
                        // This is likely a route not found 404
                        const responseText = await borrowerRes.text();
                        console.error("Route not found - Response: ", responseText)
                        toast.error('Borrower deals endpoint not available on server')
                    }
                } else if (borrowerRes.status === 401) {
                    localStorage.removeItem('token');
                    toast.error('Session expired. Please login again')
                    navigate('/login');
                } else {
                    console.error('Unexpected response status: ', borrowerRes.status);
                    toast.error('failed to fetch borrower deals')
                }

                console.log('Your UserId is:', currentUserId)

                // Fetching Transaction History

                if (currentUserId) {
                    setTransactionsLoading(true)
                    try {
                        const transactionRes = await fetch(`${BACKEND_URL}/transactions/user/${currentUserId}`, {
                            headers,
                            credentials: 'include'
                        });

                        if (transactionRes.ok) {
                            const transactionData = await transactionRes.json();
                            console.log('Transaction data:', transactionData)
                            setTransactions(transactionData);

                        } else if (transactionRes.status === 404) {
                            console.info('No transactions found for this user');
                            setTransactions([])

                        } else {
                            console.error('Failed to fetch transactions:', transactionRes.status)
                            toast.error('Failed to load transaction history');
                        }
                    } catch (transactionError) {
                        console.error('Error fetching transactions', transactionError);
                        toast.error('Error loading transaction history')
                    } finally {
                        setTransactionsLoading(false)
                    }
                }




            } catch (err) {
                console.error("Error fetching all API data:", err);
                toast.error("Error fetching API data, please try again later")
            };
        }

        fetchWalletData();
        fetchOtherData();
    }, []);




    // Creating of a wallet through button click
    const handleCreateClick = async () => {
        try {
            const { headers } = await getAuthenticatedRequest();

            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'POST',
                headers,
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
            setError('An error occurred while creating wallet');
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

    // Function to refetch transactions after deposit/withdrawal
    const refetchTransactions = async () => {
        try {
            const { headers, userId: currentUserId } = await getAuthenticatedRequest();
            
            if (currentUserId) {
                setTransactionsLoading(true);
                const transactionRes = await fetch(`${BACKEND_URL}/transactions/user/${currentUserId}`, {
                    headers,
                    credentials: 'include'
                });

                if (transactionRes.ok) {
                    const transactionData = await transactionRes.json();
                    console.log('Transaction data refreshed:', transactionData);
                    setTransactions(transactionData);
                } else if (transactionRes.status === 404) {
                    console.info('No transactions found for this user after refresh');
                    setTransactions([]);
                } else {
                    console.error('Failed to refresh transactions:', transactionRes.status);
                }
            }
        } catch (err) {
            console.error('Error refreshing transactions:', err);
        } finally {
            setTransactionsLoading(false);
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
            const { headers } = await getAuthenticatedRequest();

            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'PUT',
                headers,
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
                toast.success(`Successfully deposited ₿${depositAmount} to your wallet!`);
                
                // Refresh transactions to show the new deposit
                await refetchTransactions();

            } else if (response.status === 401) {
                localStorage.removeItem('token');
                toast.error('Session expired. Please log in again');
                navigate('/login');

            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to deposit funds');
            }

        } catch (err) {
            if (err.message === 'No authentication token' || err.message === 'Invalid token format') {
                return; // Already handled in getAuthenticatedRequest
            }
            console.error('Deposit failed', err);
            toast.error('An error occurred while depositing funds');
        } finally {
            setDepositing(false);
        }
    };

    // Handle withdrawals with negative values
    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            toast.error('Please enter a valid withdrawal amount');
            return;
        }

        if (parseFloat(withdrawAmount) > walletBalance) {
            toast.error('Insufficient funds for withdrawal');
            return;
        }

        setWithdrawing(true);
        try {
            const { headers } = await getAuthenticatedRequest();

            const response = await fetch(`${BACKEND_URL}/wallets`, {
                method: 'PUT',
                headers,
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
                
                // Refresh transactions to show the new withdrawal
                await refetchTransactions();

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
            if (err.message === 'No authentication token' || err.message === 'Invalid token format') {
                return; // Already handled in getAuthenticatedRequest
            }
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


    if (loading || transactionsLoading) {
        return (
            <div className={loadingStyles.mainContainer}>
                <DashboardHeader userEmail={userEmail} />
                <main>
                    <div className={loadingStyles.container}>
                        <div className={loadingStyles.spinner}></div>
                        <div className={loadingStyles.text}>Loading wallet...</div>
                    </div>
                </main>
                <Footer />
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

    // Add helper functions
    const getTransactionDirection = (transaction, currentUserId) => {
        if (!transaction.fromUser || !transaction.toUser) return 'Unknown';
        
        const fromUserId = transaction.fromUser._id || transaction.fromUser;
        const toUserId = transaction.toUser._id || transaction.toUser;
        
        if (fromUserId === currentUserId) return 'outgoing';
        if (toUserId === currentUserId) return 'incoming';
        return 'unknown';
    };

    const getOtherParty = (transaction, currentUserId) => {
        const direction = getTransactionDirection(transaction, currentUserId);
        
        if (direction === 'outgoing') {
            return transaction.toUser?.email || transaction.toUser?.name || 'Unknown User';
        } else if (direction === 'incoming') {
            return transaction.fromUser?.email || transaction.fromUser?.name || 'Unknown User';
        }
        return 'Unknown';
    };

    const getTransactionType = (transaction, currentUserId) => {
        const direction = getTransactionDirection(transaction, currentUserId);
        
        // Check if it's a loan-related transaction
        if (transaction.dealId) {
            if (direction === 'outgoing') {
                return transaction.isLoanRepayment ? 'Loan Repayment' : 'Loan Funding';
            } else {
                return transaction.isLoanRepayment ? 'Repayment Received' : 'Loan Received';
            }
        }
        
        // Regular wallet transactions
        if (direction === 'outgoing') {
            return transaction.isWithdrawal ? 'Withdrawal' : 'Transfer Out';
        } else if (direction === 'incoming') {
            return transaction.isDeposit ? 'Deposit' : 'Transfer In';
        }
        
        // Fallback
        return transaction.type || (transaction.amount > 0 ? 'Credit' : 'Debit');
    };

    const getTransactionAmount = (transaction, currentUserId) => {
        const direction = getTransactionDirection(transaction, currentUserId);
        const amount = Math.abs(transaction.amount || 0);
        
        return {
            amount,
            isPositive: direction === 'incoming',
            displayAmount: direction === 'incoming' ? `+${amount.toFixed(8)}` : `-${amount.toFixed(8)}`
        };
    };

    // Sort transactions by date (most recent first)
    const getSortedTransactions = (transactions) => {
        return [...transactions].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date || a.timestamp || 0);
            const dateB = new Date(b.createdAt || b.date || b.timestamp || 0);
            
            // Sort in descending order (most recent first)
            return dateB - dateA;
        });
    };

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
                            {transactionsLoading ? (
                                <div className={styles.transactionItem}>
                                    <div className={styles.transactionInfo}>
                                        <div className={styles.transactionType}>Loading transactions...</div>
                                    </div>
                                </div>
                            ) : transactions.length > 0 ? (
                                getSortedTransactions(transactions).slice(0, 10).map((transaction, index) => {
                                    const currentUserId = userId;
                                    const transactionType = getTransactionType(transaction, currentUserId);
                                    const otherParty = getOtherParty(transaction, currentUserId);
                                    const { amount, isPositive, displayAmount } = getTransactionAmount(transaction, currentUserId);
                                    const direction = getTransactionDirection(transaction, currentUserId);
                                    
                                    return (
                                        <div key={transaction._id || index} className={styles.transactionItem}>
                                            <div className={styles.transactionInfo}>
                                                <div className={styles.transactionHeader}>
                                                    <div className={styles.transactionType}>
                                                        <i className={`fas ${
                                                            transaction.dealId ? 'fa-handshake' : 
                                                            direction === 'incoming' ? 'fa-arrow-down' : 'fa-arrow-up'
                                                        }`} style={{ marginRight: '0.5rem' }}></i>
                                                        {transactionType}
                                                    </div>
                                                    {transaction.dealId && (
                                                        <div className={styles.dealBadge}>
                                                            <i className="fas fa-link"></i>
                                                            Loan Deal
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.transactionDetails}>
                                                    <div className={styles.transactionDate}>
                                                        {new Date(transaction.createdAt || transaction.date || transaction.timestamp).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                    {otherParty !== 'Unknown' && (
                                                        <div className={styles.otherParty}>
                                                            {direction === 'incoming' ? 'From: ' : 'To: '}
                                                            <span className={styles.partyEmail}>{otherParty}</span>
                                                        </div>
                                                    )}
                                                    {transaction.description && (
                                                        <div className={styles.transactionDescription}>
                                                            {transaction.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.transactionAmountSection}>
                                                <div className={`${styles.transactionAmount} ${
                                                    isPositive ? styles.positive : styles.negative
                                                }`}>
                                                    {displayAmount} BTC
                                                </div>
                                                {transaction.dealId && (
                                                    <div className={styles.dealId}>
                                                        Deal: {transaction.dealId.slice(-6)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.transactionItem}>
                                    <div className={styles.transactionInfo}>
                                        <div className={styles.transactionType}>No transactions yet</div>
                                        <div className={styles.transactionDate}>Start by making a deposit!</div>
                                    </div>
                                    <div className={styles.transactionAmount}>
                                        --
                                    </div>
                                </div>
                            )}
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
            <Footer />
        </div>
    )

};

export default Wallet;