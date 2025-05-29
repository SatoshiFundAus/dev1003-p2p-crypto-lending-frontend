import { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import styles from './AdminDashboard.module.css'
import { Navigate, useNavigate } from "react-router-dom";

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

function Wallet() {
    const navigate = useNavigate();
    const [walletBalance, setWalletBalance] = useState(0)
    const [wallet, setWallet] = useState([])
    const [userEmail, setUserEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


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

                // Common headers for all requests
                const headers = {
                    'Authorization': token,
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

    return (
        <div className={styles.adminDashboard}>
            <DashboardHeader userEmail={userEmail} />
            <h1>Your Wallet</h1>
            
            <div>Bitcoin Balance</div>
            <div>₿ {walletBalance.toFixed(8)}</div>

        </div>
    )

};

export default Wallet;