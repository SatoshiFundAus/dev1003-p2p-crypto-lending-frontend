import React, { useEffect, useState } from 'react';
import styles from './ViewLoans.module.css';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const ViewLoans = () => {
  const [loans, setLoans] = useState([]);
  const [interestTerms, setInterestTerms] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(tokenData.email);
        }
        
        const [loansRes, termsRes, cryptoRes] = await Promise.all([
          fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/loan-requests', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            mode: 'cors',
          }),
          fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/interest-terms', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            mode: 'cors',
          }),
          fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/crypto', {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            mode: 'cors',
          })
        ]);
        if (!loansRes.ok) throw new Error('Failed to fetch loans');
        if (!termsRes.ok) throw new Error('Failed to fetch interest terms');
        if (!cryptoRes.ok) throw new Error('Failed to fetch cryptocurrencies');
        const [loans, terms, cryptos] = await Promise.all([
          loansRes.json(), termsRes.json(), cryptoRes.json()
        ]);
        setLoans(loans);
        setInterestTerms(terms);
        setCryptos(cryptos);
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper functions to resolve IDs
  const getTerm = (id) => interestTerms.find(t => t._id === id);
  const getCrypto = (id) => cryptos.find(c => c._id === id);
  const getUser = (loan) => loan.borrower_id?.username || loan.borrower_id?._id || 'User';

  return (
    <div className={styles.container}>
      <DashboardHeader userEmail={userEmail} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Browse Loans</h1>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>Error: {error}</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.loansTable}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Currency</th>
                    <th>Amount</th>
                    <th>Term</th>
                    <th>Expiry</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => {
                    const term = getTerm(loan.interest_term);
                    const crypto = getCrypto(loan.cryptocurrency);
                    return (
                      <tr key={loan._id}>
                        <td>{getUser(loan)}</td>
                        <td>{crypto ? crypto.name : ''}</td>
                        <td>{loan.request_amount}</td>
                        <td>{term ? `${term.loan_length} month${term.loan_length > 1 ? 's' : ''} / ${term.interest_rate}%` : ''}</td>
                        <td>{loan.expiry_date ? new Date(loan.expiry_date).toLocaleDateString() : ''}</td>
                        <td><button className={styles.learnMoreBtn}>Learn More</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ViewLoans; 