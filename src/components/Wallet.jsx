import { useState, useEffect } from "react";
import DashboardHeader from "./DashboardHeader";
import styles from './AdminDashboard.module.css'


function Wallet() {

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
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get stored user data
                const token = localStorage.getItem('token');
                const userEmail = localStorage.getItem('userEmail')
                const isAdmin = localStorage.getItem('isAdmin') === 'true';
            } catch (err) {
                console.error('An error has occured:', err)
            }
        }
    })

    return (
        <div className={styles.adminDashboard}>
            <DashboardHeader userEmail={userEmail}/>
            <h1>Hello!</h1>
        </div>
    )

};

export default Wallet;