import React, { useState, useEffect } from 'react';
import styles from './InterestTerms.module.css';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const Cryptocurrencies = () => {
  const [cryptos, setCryptos] = useState(null);
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
        const response = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/crypto', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          mode: 'cors',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrencies');
        }
        const data = await response.json();
        setCryptos(data);
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
        <div className={styles.loading}>Loading cryptocurrencies...</div>
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
          <h1 className={styles.title}>Supported Cryptocurrencies</h1>
          <div className={styles.termsContainer}>
            <div className={styles.tableContainer}>
              <table className={styles.termsTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                  </tr>
                </thead>
                <tbody>
                  {cryptos && cryptos.map((crypto, idx) => (
                    <tr key={idx}>
                      <td>{crypto.name}</td>
                      <td><span className={styles.cryptoSymbol}>{crypto.symbol}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.note}>
              💡 These cryptocurrencies are available for lending and borrowing on our platform.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cryptocurrencies; 