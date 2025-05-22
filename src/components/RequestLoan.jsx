import React, { useState, useEffect } from 'react';
import styles from './RequestLoan.module.css';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const RequestLoan = () => {
  const [amount, setAmount] = useState('');
  const [interestTerms, setInterestTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);
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
        const [termsRes, cryptoRes] = await Promise.all([
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
        if (!termsRes.ok) throw new Error('Failed to fetch interest terms');
        if (!cryptoRes.ok) throw new Error('Failed to fetch cryptocurrencies');
        const terms = await termsRes.json();
        const cryptos = await cryptoRes.json();
        setInterestTerms(terms);
        setCryptos(cryptos);
        if (terms.length > 0) setSelectedTerm(terms[0]._id);
        if (cryptos.length > 0) setSelectedCrypto(cryptos[0]._id);
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedCryptoObj = cryptos.find(c => c._id === selectedCrypto);
  const selectedCryptoSymbol = selectedCryptoObj ? selectedCryptoObj.symbol : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('User not logged in');
      const payload = {
        borrower_id: userId,
        request_amount: parseFloat(amount),
        interest_term: selectedTerm,
        cryptocurrency: selectedCrypto
      };
      const res = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/loan-requests', {
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
      if (!res.ok) throw new Error('Failed to submit loan request');
      setSuccess(true);
      setAmount('');
    } catch (err) {
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <DashboardHeader userEmail={userEmail} />
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Request a Loan</h1>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>Error: {error}</div>
          ) : (
            <div className={styles.formContent}>
              <div className={styles.formFields}>
                <label>
                  Requested Loan Amount
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Loan Amount"
                    required
                  />
                </label>
                <label>
                  Cryptocurrency
                  <select
                    value={selectedCrypto}
                    onChange={e => setSelectedCrypto(e.target.value)}
                    required
                  >
                    {cryptos.length === 0 ? (
                      <option value="">No cryptocurrencies available</option>
                    ) : (
                      cryptos.map(coin => (
                        <option key={coin._id} value={coin._id}>
                          {coin.name} ({coin.symbol})
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <label>
                  Term Length
                  <select
                    value={selectedTerm}
                    onChange={e => setSelectedTerm(e.target.value)}
                    required
                  >
                    {interestTerms.length === 0 ? (
                      <option value="">No terms available</option>
                    ) : (
                      interestTerms.map(term => (
                        <option key={term._id} value={term._id}>
                          {term.loan_length} month{term.loan_length > 1 ? 's' : ''} @ {term.interest_rate}%
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button type="submit" className={styles.submitBtn} disabled={submitting || !amount || !selectedTerm || !selectedCrypto}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                {submitError && <div className={styles.error}>{submitError}</div>}
                {success && <div className={styles.success}>Loan request submitted!</div>}
              </div>
              <div className={styles.collateralBox}>
                <h2>Collateral Information</h2>
                <div className={styles.collateralValue}>
                  <span className={styles.collateralLabel}>Estimated Value:</span>
                  <span className={styles.collateralAmount}>{amount || '0'} {selectedCryptoSymbol}</span>
                </div>
                <div className={styles.collateralDesc}>
                  Collateral must be equal to the requested loan amount, denominated in the selected cryptocurrency.
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default RequestLoan; 