import React, { useState, useEffect } from 'react';
import styles from './InterestTerms.module.css';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

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

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(tokenData.email);
          setUserId(tokenData.sub || tokenData.id || tokenData._id || tokenData.userId || '');
        }
      } catch (err) {
        setError('Failed to decode user token');
        setLoading(false);
        return;
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://dev1003-p2p-crypto-lending-backend.onrender.com/transactions/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          mode: 'cors',
        });
        if (res.status === 404) {
          setTransactions([]);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch transactions');
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message || 'Error loading transactions');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchTransactions();
  }, [userId]);

  // Split transactions
  const outgoing = transactions.filter(t => t.isLoanRepayment && t.fromUser && (t.fromUser._id === userId || t.fromUser === userId));
  const incoming = transactions.filter(t => !t.isLoanRepayment && t.toUser && (t.toUser._id === userId || t.toUser === userId));

  // Helper to display user (mask name/email)
  const displayUser = user => {
    if (!user) return '';
    if (user.name) return maskName(user.name);
    if (user.email) return maskEmail(user.email);
    return 'User';
  };

  // Helper to display currency (fromWallet/toWallet may have currency info, fallback to BTC)
  const displayCurrency = t => {
    if (t.currency) return t.currency;
    if (t.fromWallet && t.fromWallet.currency) return t.fromWallet.currency;
    if (t.toWallet && t.toWallet.currency) return t.toWallet.currency;
    return 'BTC';
  };

  // Helper to display date
  const displayDate = d => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  // Helper to display paid/received
  const displayStatus = s => s ? 'Yes' : 'No';

  if (loading) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} />
        <div className={styles.loading}>Loading transactions...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} />
        <div className={styles.error}>Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DashboardHeader userEmail={userEmail} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Transactions</h1>
          {outgoing.length === 0 && incoming.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', margin: '2rem 0', fontSize: '1.2rem' }}>
              User has no transactions.
            </div>
          )}
          <div className={styles.termsContainer}>
            <h2 style={{ color: '#f7931a', marginBottom: '1rem', fontSize: '1.3rem' }}>Outgoing Repayments</h2>
            <table className={styles.termsTable}>
              <thead>
                <tr>
                  <th>To</th>
                  <th>Currency</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid?</th>
                </tr>
              </thead>
              <tbody>
                {outgoing.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa' }}>No outgoing repayments</td></tr>
                ) : outgoing.map((t, idx) => (
                  <tr key={idx}>
                    <td>{displayUser(t.toUser)}</td>
                    <td>{displayCurrency(t)}</td>
                    <td>{Number(t.amount).toFixed(8)}</td>
                    <td>{displayDate(t.expectedPaymentDate)}</td>
                    <td>{displayStatus(t.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.termsContainer}>
            <h2 style={{ color: '#f7931a', marginBottom: '1rem', fontSize: '1.3rem' }}>Incoming Payments</h2>
            <table className={styles.termsTable}>
              <thead>
                <tr>
                  <th>From</th>
                  <th>Currency</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Received?</th>
                </tr>
              </thead>
              <tbody>
                {incoming.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#aaa' }}>No incoming payments</td></tr>
                ) : incoming.map((t, idx) => (
                  <tr key={idx}>
                    <td>{displayUser(t.fromUser)}</td>
                    <td>{displayCurrency(t)}</td>
                    <td>{Number(t.amount).toFixed(8)}</td>
                    <td>{displayDate(t.expectedPaymentDate)}</td>
                    <td>{displayStatus(t.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transactions; 