import React, { useState, useEffect } from 'react';
import styles from './InterestTerms.module.css';
import Header from './Header';
import Footer from './Footer';

const InterestTerms = () => {
  const [interestTerms, setInterestTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterestTerms = async () => {
      try {
        const response = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/interest-terms');
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

    fetchInterestTerms();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading interest terms...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Loan Terms</h1>
          <div className={styles.termsContainer}>
            <table className={styles.termsTable}>
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Interest Rate</th>
                </tr>
              </thead>
              <tbody>
                {interestTerms && interestTerms.map((term, idx) => (
                  <tr key={idx}>
                    <td>{term.loan_length} month{term.loan_length > 1 ? 's' : ''}</td>
                    <td>{term.interest_rate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.note}>
              All loans are subject to monthly interest repayments.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterestTerms; 