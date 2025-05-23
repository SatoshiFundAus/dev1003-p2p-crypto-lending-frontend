import React, { useState, useEffect } from 'react';
import styles from './RequestLoan.module.css';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';

const RequestLoan = () => {
  const [amount, setAmount] = useState('');
  const [amountInputFocused, setAmountInputFocused] = useState(false);
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
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(tokenData.email);
          setUserId(tokenData.sub || tokenData.id || tokenData._id || tokenData.userId || '');
          console.log('Decoded JWT:', tokenData);
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
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedCrypto && cryptos.length > 0) {
      setSelectedCrypto(cryptos[0]._id);
    }
  }, [cryptos, selectedCrypto]);

  const selectedCryptoObj = cryptos.find(c => c._id === selectedCrypto);
  const selectedCryptoSymbol = selectedCryptoObj ? selectedCryptoObj.symbol : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(false);
    let cryptoToUse = selectedCrypto;
    if (!cryptoToUse && cryptos.length > 0) {
      cryptoToUse = cryptos[0]._id;
      setSelectedCrypto(cryptoToUse);
    }
    console.log('SelectedCrypto:', selectedCrypto, 'cryptoToUse:', cryptoToUse, 'cryptos:', cryptos);
    try {
      const token = localStorage.getItem('token');
      if (!userId) throw new Error('User not logged in');
      // Find selected crypto symbol
      const selectedCryptoObj = cryptos.find(c => c._id === cryptoToUse);
      const selectedCryptoSymbol = selectedCryptoObj ? selectedCryptoObj.symbol : '';
      // Find selected term loan length
      const selectedTermObj = interestTerms.find(t => t._id === selectedTerm);
      const selectedTermLoanLength = selectedTermObj ? selectedTermObj.loan_length : '';
      const payload = {
        request_amount: parseFloat(amount),
        loan_term: Number(selectedTermLoanLength),
        cryptocurrency_symbol: selectedCryptoSymbol
      };
      console.log('Submitting loan request payload:', payload);
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
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error response:', errorText);
        throw new Error('Failed to submit loan request');
      }
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
                    value={
                      amountInputFocused
                        ? amount
                        : amount
                        ? Number(amount).toFixed(8)
                        : '0.00000000'
                    }
                    onChange={e => setAmount(e.target.value)}
                    onFocus={() => setAmountInputFocused(true)}
                    onBlur={() => setAmountInputFocused(false)}
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
                      interestTerms
                        .sort((a, b) => a.loan_length - b.loan_length)
                        .map(term => (
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
                  <span className={styles.collateralLabel}>Collateral Required:</span>
                  <span className={styles.collateralAmount}><b>{amount ? Number(amount).toFixed(8) : '0.00000000'} {selectedCryptoSymbol}</b></span>
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