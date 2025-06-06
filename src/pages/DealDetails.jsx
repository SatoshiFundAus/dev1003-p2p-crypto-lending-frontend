import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import styles from '../styles/DealDetails.module.css'; // Use dedicated styles
import { toast } from 'react-toastify';

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

const DealDetails = () => {
    const { dealId } = useParams();
    const navigate = useNavigate();
    const [deal, setDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userEmail, setUserEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
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
        const fetchDeal = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    toast.error('You are not authenticated. Please log in');
                    navigate('/login');
                    return;
                }

                // Try to fetch individual deal details
                const res = await fetch(`${BACKEND_URL}/deals/${dealId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });
                
                if (res.status === 404) {
                    setDeal(null);
                } else if (!res.ok) {
                    throw new Error('Failed to fetch deal details');
                } else {
                    const dealData = await res.json();
                    setDeal(dealData);
                }
            } catch (err) {
                setError(err.message || 'Error loading deal');
            } finally {
                setLoading(false);
            }
        };
        fetchDeal();
    }, [dealId, navigate]);

    if (loading) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} />
                <main className={styles.main}>
                    <div className={styles.content}>
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <div className={styles.loadingText}>Loading deal details...</div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} />
                <main className={styles.main}>
                    <div className={styles.content}>
                        <button
                            onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}
                            className={styles.backButton}
                        >
                            <i className="fas fa-arrow-left"></i>
                            Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                        </button>
                        <div className={styles.errorCard}>
                            <i className="fas fa-exclamation-triangle"></i>
                            <h3>Error Loading Deal</h3>
                            <p>{error}</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!deal) {
        return (
            <div className={styles.container}>
                <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} />
                <main className={styles.main}>
                    <div className={styles.content}>
                        <button
                            onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}
                            className={styles.backButton}
                        >
                            <i className="fas fa-arrow-left"></i>
                            Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                        </button>
                        <div className={styles.notFoundCard}>
                            <i className="fas fa-search"></i>
                            <h3>Deal Not Found</h3>
                            <p>The deal may have been completed or is no longer active.</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <DashboardHeader userEmail={userEmail} isAdmin={isAdmin} />
            <main className={styles.main}>
                <div className={styles.content}>
                    <button
                        onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}
                        className={styles.backButton}
                    >
                        <i className="fas fa-arrow-left"></i>
                        Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                    </button>
                    
                    <div className={styles.headerCard}>
                        <div className={styles.dealHeader}>
                            <div className={styles.titleSection}>
                                <h1 className={styles.title}>
                                    <i className="fas fa-handshake"></i>
                                    Deal Details
                                </h1>
                                <div className={styles.dealId}>ID: {deal._id}</div>
                            </div>
                            <div className={styles.statusBadge}>
                                <span className={`${styles.status} ${styles[deal?.loanDetails?.status?.toLowerCase()]}`}>
                                    {deal?.loanDetails?.status || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.detailsGrid}>
                        {/* Parties Card */}
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <i className="fas fa-users"></i>
                                <h3>Parties Involved</h3>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-user-minus"></i>
                                        Borrower ID
                                    </span>
                                    <span className={styles.value}>{deal?.loanDetails?.borrower_id || 'N/A'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-user-plus"></i>
                                        Lender
                                    </span>
                                    <span className={styles.value}>{deal?.lenderId?.email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Details Card */}
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <i className="fab fa-bitcoin"></i>
                                <h3>Financial Details</h3>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-coins"></i>
                                        Amount
                                    </span>
                                    <span className={styles.value}>₿{deal?.loanDetails?.request_amount || 'N/A'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-chart-line"></i>
                                        Interest Term ID
                                    </span>
                                    <span className={styles.value}>{deal?.loanDetails?.interest_term || 'N/A'}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-money-bill-wave"></i>
                                        Cryptocurrency ID
                                    </span>
                                    <span className={styles.value}>{deal?.loanDetails?.cryptocurrency || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Timeline Card */}
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <i className="fas fa-calendar-alt"></i>
                                <h3>Timeline</h3>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-clock"></i>
                                        Request Date
                                    </span>
                                    <span className={styles.value}>
                                        {deal?.loanDetails?.request_date ? 
                                            new Date(deal.loanDetails.request_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'
                                        }
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-calendar-check"></i>
                                        Expected Completion
                                    </span>
                                    <span className={styles.value}>
                                        {deal?.expectedCompletionDate ? 
                                            new Date(deal.expectedCompletionDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'
                                        }
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-plus-circle"></i>
                                        Created
                                    </span>
                                    <span className={styles.value}>
                                        {deal?.createdAt ? 
                                            new Date(deal.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <i className="fas fa-info-circle"></i>
                                <h3>Status Information</h3>
                            </div>
                            <div className={styles.cardContent}>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-check-circle"></i>
                                        Completed
                                    </span>
                                    <span className={`${styles.value} ${deal?.isComplete ? styles.successText : styles.pendingText}`}>
                                        {deal?.isComplete ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.label}>
                                        <i className="fas fa-thermometer-half"></i>
                                        Deal Status
                                    </span>
                                    <span className={styles.value}>
                                        <span className={`${styles.statusIndicator} ${styles[deal?.loanDetails?.status?.toLowerCase()]}`}>
                                            {deal?.loanDetails?.status || 'Unknown'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionSection}>
                        <button
                            className={styles.primaryButton}
                            onClick={() => alert('Admin actions coming soon!')}
                        >
                            <i className="fas fa-cog"></i>
                            Manage Deal
                        </button>
                        <button
                            className={styles.secondaryButton}
                            onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}
                        >
                            <i className="fas fa-arrow-left"></i>
                            Back to {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DealDetails;