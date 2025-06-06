import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/LoanDetails.module.css';
import Footer from '../components/Footer';
import DashboardHeader from '../components/DashboardHeader';

function maskName(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts.map(part =>
    part.length <= 2
      ? part[0] + '*'
      : part.slice(0, 2) + '*'.repeat(Math.max(1, part.length - 2))
  ).join(' ');
}

function maskEmail(email) {
  if (!email) return '';
  const [user, domainFull] = email.split('@');
  const [domain, ...tldParts] = domainFull.split('.');
  const tld = tldParts.length ? '.' + tldParts.join('.') : '';
  const maskedUser = user.slice(0, 2) + '*'.repeat(Math.max(1, user.length - 2));
  const maskedDomain = domain.slice(0, 2) + '*'.repeat(Math.max(1, domain.length - 2));
  return maskedUser + '@' + maskedDomain + tld;
}

const LoanDetails = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [funding, setFunding] = useState(false);
  const [fundError, setFundError] = useState(null);
  const [fundSuccess, setFundSuccess] = useState(null);
  const [showWalletButton, setShowWalletButton] = useState(false);

  useEffect(() => {
    // Extract user email and id from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(tokenData.email);
        setUserId(tokenData.sub || tokenData.id || tokenData._id || tokenData.userId || '');
      } catch {
        setUserEmail('');
        setUserId('');
      }
    }
  }, []);

  useEffect(() => {
    const fetchLoan = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://dev1003-p2p-crypto-lending-backend.onrender.com/loan-requests/${loanId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          mode: 'cors',
        });
        if (res.status === 404) {
          setLoan(null);
        } else if (!res.ok) {
          throw new Error('Failed to fetch loan');
        } else {
          const data = await res.json();
          setLoan(data);
        }
      } catch (err) {
        setError(err.message || 'Error loading loan');
      } finally {
        setLoading(false);
      }
    };
    fetchLoan();
  }, [loanId, fundSuccess]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleFundLoan = async () => {
    setFunding(true);
    setFundError(null);
    setFundSuccess(null);
    setShowWalletButton(false);
    try {
      const token = localStorage.getItem('token');
      if (!userId) throw new Error('User not logged in');
      const payload = {
        lenderId: userId,
        loanDetails: loanId
      };

      const res = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errorMessage;
        try {
          const errorData = await res.json();
          if (errorData.error && errorData.error.includes('Lender does not have sufficient funds')) {
            errorMessage = 'Insufficient funds in your wallet. Please add more funds to your wallet to fund this loan.';
            setShowWalletButton(true);
          } else {
            errorMessage = errorData.error || 'Failed to fund loan';
          }
        } catch {
          errorMessage = 'Failed to fund loan';
        }
        throw new Error(errorMessage);
      }
      setFundSuccess('Loan funded successfully!');

    } catch (err) {
      console.error('Funding error:', err);
      setFundError(err.message || 'Failed to fund loan');
      
    } finally {
      setFunding(false);
    }
  };

  let userDisplay = '';
  if (loan?.borrower_id?.name) {
    userDisplay = maskName(loan.borrower_id.name);
  } else if (loan?.borrower_id?.email) {
    userDisplay = maskEmail(loan.borrower_id.email);
  } else {
    userDisplay = 'Anonymous User';
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <div className={styles.loadingText}>Loading loan details...</div>
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
        <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.content}>
            <button
              onClick={() => navigate('/view-loans')}
              className={styles.backButton}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Browse Loans
            </button>
            <div className={styles.errorCard}>
              <i className="fas fa-exclamation-triangle"></i>
              <h3>Error Loading Loan</h3>
              <p>{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.content}>
            <button
              onClick={() => navigate('/view-loans')}
              className={styles.backButton}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Browse Loans
            </button>
            <div className={styles.notFoundCard}>
              <i className="fas fa-search"></i>
              <h3>Loan Not Found</h3>
              <p>This loan request may have been removed or is no longer available.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
      <main className={styles.main}>
        <div className={styles.content}>
          <button
            onClick={() => navigate('/view-loans')}
            className={styles.backButton}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Browse Loans
          </button>
          
          {fundError && (
            <div className={styles.alertCard}>
              <div className={styles.alertContent}>
                <i className="fas fa-exclamation-triangle"></i>
                <div>
                  <h4>Funding Error</h4>
                  <p>{fundError}</p>
                  {showWalletButton && (
                    <button 
                      onClick={() => navigate('/wallet')}
                      className={styles.walletButton}
                    >
                      <i className="fas fa-wallet"></i>
                      Go to Wallet
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {fundSuccess && (
            <div className={styles.successCard}>
              <div className={styles.alertContent}>
                <i className="fas fa-check-circle"></i>
                <div>
                  <h4>Success!</h4>
                  <p>{fundSuccess}</p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.headerCard}>
            <div className={styles.loanHeader}>
              <div className={styles.titleSection}>
                <h1 className={styles.title}>
                  <i className="fas fa-hand-holding-usd"></i>
                  Loan Request Details
                </h1>
                <div className={styles.loanId}>ID: {loan._id}</div>
              </div>
              <div className={styles.statusBadge}>
                <span className={`${styles.status} ${styles[loan.status?.toLowerCase()]}`}>
                  {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            {/* Borrower Information Card */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <i className="fas fa-user"></i>
                <h3>Borrower Information</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-user-circle"></i>
                    Borrower
                  </span>
                  <span className={styles.value}>{userDisplay}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-calendar-alt"></i>
                    Request Date
                  </span>
                  <span className={styles.value}>
                    {loan.request_date ? 
                      new Date(loan.request_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'
                    }
                  </span>
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
                    Amount Requested
                  </span>
                  <span className={styles.value}>₿{loan.request_amount}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-money-bill-wave"></i>
                    Cryptocurrency
                  </span>
                  <span className={styles.value}>
                    {loan.cryptocurrency ? 
                      `${loan.cryptocurrency.name} (${loan.cryptocurrency.symbol})` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Loan Terms Card */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <i className="fas fa-percentage"></i>
                <h3>Loan Terms</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-clock"></i>
                    Duration
                  </span>
                  <span className={styles.value}>
                    {loan.interest_term ? 
                      `${loan.interest_term.loan_length} month${loan.interest_term.loan_length > 1 ? 's' : ''}` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-chart-line"></i>
                    Interest Rate
                  </span>
                  <span className={styles.value}>
                    {loan.interest_term ? 
                      `${loan.interest_term.interest_rate}%` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-calendar-times"></i>
                    Expiry Date
                  </span>
                  <span className={styles.value}>
                    {loan.expiry_date ? 
                      new Date(loan.expiry_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Status Information Card */}
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <i className="fas fa-info-circle"></i>
                <h3>Status Information</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-flag"></i>
                    Current Status
                  </span>
                  <span className={styles.value}>
                    <span className={`${styles.statusIndicator} ${styles[loan.status?.toLowerCase()]}`}>
                      {loan.status?.charAt(0).toUpperCase() + loan.status?.slice(1)}
                    </span>
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.label}>
                    <i className="fas fa-handshake"></i>
                    Availability
                  </span>
                  <span className={`${styles.value} ${loan.status === 'pending' ? styles.successText : styles.warningText}`}>
                    {loan.status === 'pending' ? 'Available for Funding' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {loan.status === 'pending' && (
            <div className={styles.actionSection}>
              <button
                className={styles.primaryButton}
                onClick={handleFundLoan}
                disabled={funding}
              >
                {funding ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Funding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-hand-holding-usd"></i>
                    Fund This Loan
                  </>
                )}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => navigate('/view-loans')}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Browse
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoanDetails; 