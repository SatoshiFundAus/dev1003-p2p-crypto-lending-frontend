import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import loadingStyles from './Loading.module.css';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import { toast } from 'react-toastify';

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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const [underDevelopment, setUnderDevelopment] = useState(false)

    useEffect(() => {
        const fetchAdminData = async () => {
            try {

                setLoading(true);
                setError(null)

                // Get stored user data
                const token = localStorage.getItem('token');
                const userEmail = localStorage.getItem('userEmail');
                const isAdmin = localStorage.getItem('isAdmin') === 'true';


                if (!token || !isAdmin) {
                    console.log('Not authenticated or not admin:', { token: !!token, isAdmin });
                    navigate('/login');
                    return;
                }

                // Common headers for all requests
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };


                // Fetch admin dashboard data
                const [completedRes, activeRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/admin/deals-complete`, {
                        headers,
                        credentials: 'include'
                    }),
                    fetch(`${BACKEND_URL}/admin/deals-incomplete`, {
                        headers,
                        credentials: 'include'
                    })
                ]);

                if (!completedRes.ok || !activeRes.ok) {

                    // If unauthorized, redirect to login
                    if (completedRes.status === 401 || activeRes.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('isAdmin');
                        navigate('/login');
                        throw new Error('Unauthorized access. Please login again.');
                    }
                    throw new Error(`Failed to fetch data. Status: ${completedRes.status}, ${activeRes.status}`);
                }

                const [completedData, activeData] = await Promise.all([
                    completedRes.json(),
                    activeRes.json()
                ]);

                // Try to fetch average interest rate
                let avgInterestRate = 0;
                try {
                    const avgInterestRes = await fetch(`${BACKEND_URL}/admin/average-interest-rate`, {
                        headers,
                        credentials: 'include'
                    });

                    if (avgInterestRes.ok) {
                        const avgInterestData = await avgInterestRes.json();
                        const rawInterestRate = avgInterestData.averageInterestRate || 0;
                        avgInterestRate = rawInterestRate.toFixed(2);
                        console.log('Average interest rate fetched:', avgInterestRate);
                    } else {
                        console.log('Average interest rate endpoint not available yet (Status:', avgInterestRes.status, ')');
                        toast.error('Error trying to fetch data')
                    }
                } catch (err) {
                    console.log('Average interest rate endpoint not implemented yet:', err.message);
                    setError('Failed to fetch interest average interest rate')
                }

                // Try to fetch total collateral value
                let totalCollateralValue = 0;
                try {
                    const totalCollateralRes = await fetch(`${BACKEND_URL}/admin/collateral/total`, {
                        headers,
                        credentials: 'include'
                    });

                    if (totalCollateralRes.ok) {
                        const totalCollateralData = await totalCollateralRes.json();
                        totalCollateralValue = totalCollateralData.totalCollateral || 0;
                        console.log('Total collateral value fetched:', totalCollateralValue);
                    } else {
                        console.log('Total collateral endpoint not available yet (Status:', totalCollateralRes.status, ')');
                        
                    }
                } catch (err) {
                    console.log('Error fetching total collateral value:', err.message);
                    setError('An error occured while loading Collateral Value')
                    totalCollateralValue = 2500000;
                }

                setStats(prevStats => ({
                    ...prevStats,
                    totalLoansFunded: completedData.totalCompletedDeals || 0,
                    activeLoans: activeData.ActiveDeals || 0,
                    averageInterestRate: avgInterestRate,
                    totalCollateralValue: totalCollateralValue,
                    platformEarnings: 75000
                }));

                // Try to fetch loans data
                let loansData = [];
                try {
                    const loansRes = await fetch(`${BACKEND_URL}/admin/deals-active`, {
                        headers,
                        credentials: 'include'
                    });

                    if (loansRes.ok) {
                        const activeDealsData = await loansRes.json();

                        // Transform the backend data to match our frontend table structure
                        loansData = activeDealsData.map(deal => {
                            return {
                                id: deal.dealId,
                                borrower: deal.borrowerEmail,
                                lender: deal.lenderEmail,
                                amount: deal.amount,
                                status: deal.dealStatus,
                                expectedCompletion: deal.expectedCompletionDate
                            }
                        })

                    } else {
                        console.log('Active deals endpoint not available yet (Status:', loansRes.status, ')');
                    }

                } catch (err) {
                    console.log('Error fetching loans data:', err.message);
                    loansData = [
                        {
                            id: 1,
                            borrower: 'john.doe@example.com',
                            lender: 'jane.smith@example.com',
                            amount: 50000,
                            status: 'Active',
                        }
                    ];
                    setError('Error fetching loans data')
                }

                setLoans(loansData);


            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError(err.message);
                setStats({
                    totalLoansFunded: 0,
                    activeLoans: 0,
                    averageInterestRate: 0,
                    totalCollateralValue: 0,
                    platformEarnings: 0
                });
            } finally {
                setLoading(false)
            }
        };

        fetchAdminData();
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

    // Flag Suspicious Accounts under development
    const buttonDevelopment = () => {
        setUnderDevelopment(true)
    }

    if (underDevelopment) {
        return (
            <div className={styles.adminDashboard}>
                <DashboardHeader userEmail={userEmail} isAdmin={true} />
                <div className={styles.content}>
                    <div style={{ fontSize: '2rem' }}>This feature is under development</div>
                </div>

                <button
                    className={styles.actionButton}
                    onClick={() => setUnderDevelopment(false)}
                    style={{ marginTop: '20px' }}
                >
                    <i className='fas fa-arrow-left'></i>
                    Back to Dashboard
                </button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className={loadingStyles.mainContainer}>
                <DashboardHeader userEmail={userEmail} isAdmin={true} />
                <main>
                    <div className={loadingStyles.container}>
                        <div className={loadingStyles.spinner}></div>
                        <div className={loadingStyles.text}>Loading...</div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    // Show error message if there's an error
    if (error) {
        return (
            <div className={styles.adminDashboard}>
                <DashboardHeader userEmail={userEmail} isAdmin={true} />
                <div className={styles.content}>
                    <div className={styles.error}>
                        Error: {error}
                    </div>
                </div>
            </div>
        );
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
                        <a href='#loans'>
                            <i className="fas fa-chart-line"></i>
                            <h3>Active Loans</h3>
                            <p>{stats.activeLoans}</p>
                        </a>
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

                <div className={styles.tableContainer} id='loans'>
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
                                        <td>&#x0e3f; {loan.amount}</td>
                                        <td>
                                            <span className={`${styles.status} ${styles[loan.status.toLowerCase()]}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Currently the button is not correctly loading the loan*/}
                                            <button
                                                className={styles.viewButton}
                                                onClick={() => navigate(`/deals/${loan.id}`)}
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
                        onClick={() => buttonDevelopment()}
                    >
                        <i className="fas fa-user-shield"></i>
                        Flag or Ban Suspicious Accounts
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AdminDashboard; 