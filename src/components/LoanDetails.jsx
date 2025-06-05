import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './LoanDetails.module.css';
import Footer from './Footer';
import DashboardHeader from './DashboardHeader';

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
      setFundSuccess('Loan funded!');

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
    userDisplay = 'User';
  }

  return (
    <div className={styles.container}>
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
      <main className={styles.main}>
        <div className={styles.content}>
          <button
            onClick={() => navigate('/view-loans')}
            style={{
              background: 'none',
              border: 'none',
              color: '#f7931a',
              fontWeight: 600,
              fontSize: '1.05rem',
              cursor: 'pointer',
              padding: 0,
              marginBottom: '1.2rem',
              textDecoration: 'underline',
              display: 'block',
              textAlign: 'left',
            }}
            aria-label="Back to Browse Loans"
          >
            &larr; Back to Browse Loans
          </button>
          {fundError && (
            <div className={styles.error}>
              {fundError}
              {showWalletButton && (
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={() => navigate('/wallet')}
                    className={styles.walletButton}
                  >
                    Go to Wallet
                  </button>
                </div>
              )}
            </div>
          )}
          {fundSuccess && <div className={styles.success}>{fundSuccess}</div>}
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>Error: {error}</div>
          ) : !loan ? (
            <div className={styles.notFound}>Loan not found.</div>
          ) : (
            <div className={styles.loanCard}>
              <h1 className={styles.title}>Loan Details</h1>
              <div className={styles.detailRow}><span className={styles.label}>User:</span> {userDisplay}</div>
              <div className={styles.detailRow}><span className={styles.label}>Currency:</span> {loan.cryptocurrency ? `${loan.cryptocurrency.name} (${loan.cryptocurrency.symbol})` : ''}</div>
              <div className={styles.detailRow}><span className={styles.label}>Amount:</span> {loan.request_amount}</div>
              <div className={styles.detailRow}><span className={styles.label}>Term:</span> {loan.interest_term ? `${loan.interest_term.loan_length} month${loan.interest_term.loan_length > 1 ? 's' : ''} / ${loan.interest_term.interest_rate}%` : ''}</div>
              <div className={styles.detailRow}><span className={styles.label}>Expiry:</span> {loan.expiry_date ? new Date(loan.expiry_date).toLocaleDateString() : ''}</div>
              <div className={styles.detailRow}><span className={styles.label}>Status:</span> {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}</div>
              {loan.status === 'pending' && (
                <button
                  className={styles.fundBtn}
                  onClick={handleFundLoan}
                  disabled={funding}
                >
                  {funding ? 'Funding...' : 'Fund Loan'}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoanDetails; 