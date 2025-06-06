import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import styles from './ViewLoans.module.css'; // Reuse existing styles
import loadingStyles from './Loading.module.css';
import { toast } from 'react-toastify';

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

const ViewDeals = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Extract user email from JWT token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(tokenData.email);
                setIsAdmin(localStorage.getItem('isAdmin') === 'true');
            } catch {
                setUserEmail('');
                setIsAdmin(false);
            }
        }
    }, []);

    useEffect(() => {
        const fetchDeals = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    toast.error('You are not authenticated. Please log in');
                    navigate('/login');
                    return;
                }

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // Fetch deals where user is lender and borrower in parallel
                const [lenderRes, borrowerRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/lender-deals`, {
                        headers,
                        credentials: 'include'
                    }).catch(() => ({ ok: false, status: 404 })), // Handle network errors gracefully

                    fetch(`${BACKEND_URL}/borrower-deals`, {
                        headers,
                        credentials: 'include'
                    }).catch(() => ({ ok: false, status: 404 })) // Handle network errors gracefully
                ]);

                let allDeals = [];

                // Process lender deals
                if (lenderRes.ok) {
                    const lenderDeals = await lenderRes.json();
                    allDeals = [...allDeals, ...lenderDeals];
                } else if (lenderRes.status !== 404) {
                    console.warn('Failed to fetch lender deals:', lenderRes.status);
                }

                // Process borrower deals  
                if (borrowerRes.ok) {
                    const borrowerDeals = await borrowerRes.json();
                    allDeals = [...allDeals, ...borrowerDeals];
                } else if (borrowerRes.status !== 404) {
                    console.warn('Failed to fetch borrower deals:', borrowerRes.status);
                }

                // Remove duplicates based on deal ID
                const uniqueDeals = allDeals.filter((deal, index, self) =>
                    index === self.findIndex(d => (d._id || d.dealId) === (deal._id || deal.dealId))
                );

                // Transform the data for display - handle both API response formats
                const transformedDeals = uniqueDeals.map((deal, index) => {
                    return {
                        id: deal._id || deal.dealId || `temp-${index}`,
                        borrowerId: deal.borrowerEmail || deal.loanDetails?.borrower_id || 'N/A',
                        lenderEmail: deal.lenderEmail || deal.lenderId?.email || 'N/A',
                        amount: deal.amount || deal.loanDetails?.request_amount || 0,
                        status: deal.dealStatus || deal.loanDetails?.status || 'active',
                        expectedCompletion: deal.expectedCompletionDate,
                        isComplete: deal.isComplete || false,
                        interestTermId: deal.interestTermId || deal.loanDetails?.interest_term,
                        cryptocurrencyId: deal.cryptocurrencyId || deal.loanDetails?.cryptocurrency
                    };
                });

                setDeals(transformedDeals);

                // Update subtitle to reflect what we're showing
                if (transformedDeals.length === 0) {
                    toast.info('No active deals found. You can browse loan requests to start lending.');
                }

            } catch (err) {
                console.error('Error fetching deals:', err);
                setError(err.message || 'Error loading deals');
                toast.error('Failed to load deals');
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('isAdmin');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} onLogout={handleLogout} />
                <main className={styles.main}>
                    <div className={loadingStyles.container}>
                        <div className={loadingStyles.spinner}></div>
                        <div className={loadingStyles.text}>Loading deals...</div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} onLogout={handleLogout} />
                <main className={styles.main}>
                    <div className={styles.content}>
                        <div className={styles.errorCard}>
                            <h2>Error Loading Deals</h2>
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className={styles.retryButton}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} onLogout={handleLogout} />
            <main className={styles.main}>
                <div className={styles.content}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>

                            Active Deals
                        </h1>
                        <p className={styles.subtitle}>
                            Browse all active lending deals in the platform
                        </p>
                    </div>

                    {deals.length === 0 ? (
                        <div className={styles.emptyState}>
                            <i className="fas fa-handshake"></i>
                            <h3>No Active Deals</h3>
                            <p>There are currently no active deals to display.</p>
                            <button
                                onClick={() => navigate('/view-loans')}
                                className={styles.primaryButton}
                            >
                                <i className="fas fa-search"></i>
                                Browse Loan Requests
                            </button>
                        </div>
                    ) : (
                        <div className={styles.dealsGrid}>
                            {deals.map(deal => (
                                <div
                                    key={deal.id || Math.random()}
                                    className={styles.dealCard}
                                    onClick={() => navigate(`/deals/${deal.id || 'unknown'}`)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div className={styles.dealInfo}>
                                            <h3>Deal #{deal.id ? deal.id.slice(-8) : 'Unknown'}</h3>
                                            <span className={`${styles.status} ${styles[deal.status?.toLowerCase() || 'active']}`}>
                                                {deal.status ? (deal.status.charAt(0).toUpperCase() + deal.status.slice(1)) : 'Active'}
                                            </span>
                                        </div>
                                        <div className={styles.amount}>
                                            ₿{deal.amount || '0'}
                                        </div>
                                    </div>

                                    <div className={styles.cardContent}>
                                        <div className={styles.detail}>
                                            <span className={styles.label}>
                                                <i className="fas fa-user-minus"></i>
                                                Borrower
                                            </span>
                                            <span className={styles.value}>
                                                {deal.borrowerId || 'N/A'}
                                            </span>
                                        </div>

                                        <div className={styles.detail}>
                                            <span className={styles.label}>
                                                <i className="fas fa-user-plus"></i>
                                                Lender
                                            </span>
                                            <span className={styles.value}>
                                                {deal.lenderEmail || 'N/A'}
                                            </span>
                                        </div>

                                        <div className={styles.detail}>
                                            <span className={styles.label}>
                                                <i className="fas fa-calendar-check"></i>
                                                Expected Completion
                                            </span>
                                            <span className={styles.value}>
                                                {deal.expectedCompletion ?
                                                    new Date(deal.expectedCompletion).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : 'N/A'
                                                }
                                            </span>
                                        </div>

                                        <div className={styles.detail}>
                                            <span className={styles.label}>
                                                <i className="fas fa-info-circle"></i>
                                                Deal Status
                                            </span>
                                            <span className={`${styles.value} ${styles.statusText}`}>
                                                {deal.status ? (deal.status.charAt(0).toUpperCase() + deal.status.slice(1)) : 'Active'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.cardFooter}>
                                        <button className={styles.viewButton}>
                                            <i className="fas fa-eye"></i>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ViewDeals; 