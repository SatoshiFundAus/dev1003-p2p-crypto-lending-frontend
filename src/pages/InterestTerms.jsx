import React, { useState, useEffect } from 'react';
import styles from '../styles/InterestTerms.module.css';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';

const InterestTerms = () => {
  const [interestTerms, setInterestTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(tokenData.email);
        }

        const response = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/interest-terms', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          mode: 'cors',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch interest terms');
        }
        const data = await response.json();
        setInterestTerms(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} />
        <div className={styles.loading}>Loading interest terms...</div>
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
          <h1 className={styles.title}>Loan Terms</h1>
          <div className={styles.termsContainer}>
            <div className={styles.tableContainer}>
              <table className={styles.termsTable}>
                <thead>
                  <tr>
                    <th>Term</th>
                    <th>Interest Rate P.A.</th>
                  </tr>
                </thead>
                <tbody>
                  {interestTerms && [...interestTerms].sort((a, b) => a.loan_length - b.loan_length).map((term, idx) => (
                    <tr key={idx}>
                      <td>{term.loan_length} month{term.loan_length > 1 ? 's' : ''}</td>
                      <td className={styles.interestRate}>{term.interest_rate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.note}>
              All loans are subject to monthly interest repayments. Interest rates are calculated per annum.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterestTerms; 