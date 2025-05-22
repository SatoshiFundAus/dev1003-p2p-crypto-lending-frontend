import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import DashboardHeader from './DashboardHeader';

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalLoansFunded: 0,
        activeLoans: 0,
        averageInterestRate: 0,
        totalCollateralValue: 0,
        platformEarnings: 0
    });
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        // Get stored user data
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (!token || !isAdmin) {
            console.log('Not authenticated or not admin:', { token: !!token, isAdmin });
            navigate('/login');
            return;
        }

        // Fetch admin dashboard data
        Promise.all([
            fetch(`${BACKEND_URL}/admin/stats`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch(`${BACKEND_URL}/admin/loans`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        ])
        .then(([statsRes, loansRes]) => {
            if (!statsRes.ok || !loansRes.ok) {
                throw new Error('Failed to fetch admin data');
            }
            return Promise.all([statsRes.json(), loansRes.json()]);
        })
        .then(([statsData, loansData]) => {
            setStats(statsData);
            setLoans(loansData);
        })
        .catch(err => {
            console.error('Error fetching admin data:', err);
            // For development, set example data
            setStats({
                totalLoansFunded: 150,
                activeLoans: 75,
                averageInterestRate: 12.5,
                totalCollateralValue: 2500000,
                platformEarnings: 75000
            });

            setLoans([
                {
                    id: 1,
                    borrower: 'john.doe@example.com',
                    lender: 'jane.smith@example.com',
                    amount: 50000,
                    status: 'Active',
                },
                {
                    id: 2,
                    borrower: 'bob.wilson@example.com',
                    lender: 'alice.brown@example.com',
                    amount: 75000,
                    status: 'Pending',
                },
                {
                    id: 3,
                    borrower: 'sarah.jones@example.com',
                    lender: 'mike.davis@example.com',
                    amount: 100000,
                    status: 'Completed',
                }
            ]);
        });
    }, [navigate]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Get userEmail from localStorage for the header
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.adminDashboard}>
            <DashboardHeader userEmail={userEmail} isAdmin={true} />
            <div className={styles.content}>
                <h1>Admin Dashboard</h1>
                
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <i className="fas fa-money-bill-wave"></i>
                        <h3>Total Loans Funded</h3>
                        <p>{stats.totalLoansFunded}</p>
                    </div>
                    <div className={styles.statCard}>
                        <i className="fas fa-chart-line"></i>
                        <h3>Active Loans</h3>
                        <p>{stats.activeLoans}</p>
                    </div>
                    <div className={styles.statCard}>
                        <i className="fas fa-percentage"></i>
                        <h3>Average Interest Rate</h3>
                        <p>{stats.averageInterestRate}%</p>
                    </div>
                    <div className={styles.statCard}>
                        <i className="fas fa-shield-alt"></i>
                        <h3>Total Collateral Value</h3>
                        <p>{formatCurrency(stats.totalCollateralValue)}</p>
                    </div>
                    <div className={styles.statCard}>
                        <i className="fas fa-coins"></i>
                        <h3>Platform Earnings</h3>
                        <p>{formatCurrency(stats.platformEarnings)}</p>
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <h2>Current Loans</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.loansTable}>
                            <thead>
                                <tr>
                                    <th>Borrower</th>
                                    <th>Lender</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map(loan => (
                                    <tr key={loan.id}>
                                        <td>{loan.borrower}</td>
                                        <td>{loan.lender}</td>
                                        <td>{formatCurrency(loan.amount)}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[loan.status.toLowerCase()]}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className={styles.viewButton}
                                                onClick={() => navigate(`/loans/${loan.id}`)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.adminActions}>
                    <button 
                        className={styles.actionButton}
                        onClick={() => navigate('/admin/users')}
                    >
                        <i className="fas fa-users"></i>
                        View All Registered Users
                    </button>
                    <button 
                        className={styles.actionButton}
                        onClick={() => navigate('/admin/suspicious-accounts')}
                    >
                        <i className="fas fa-user-shield"></i>
                        Flag or Ban Suspicious Accounts
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 