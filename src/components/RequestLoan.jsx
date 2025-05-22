import React, { useState } from 'react';
import styles from './RequestLoan.module.css';
import Header from './Header';
import Footer from './Footer';

const RequestLoan = () => {
  const [amount] = useState('');

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <form className={styles.form}>
          <h1 className={styles.title}>Request a Loan</h1>
          <div className={styles.formContent}>
            <div className={styles.formFields}>
              <label>
                Requested Loan Amount
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  placeholder="Loan Amount"
                  disabled
                />
              </label>
              <label>
                Term Length
                <select value="" disabled>
                  <option value="">Select Term</option>
                </select>
              </label>
              <label>
                Cryptocurrency
                <select value="" disabled>
                  <option value="">Select Currency</option>
                </select>
              </label>
            </div>
            <div className={styles.collateralBox}>
              <h2>Collateral Information</h2>
              <div className={styles.collateralValue}>
                <span className={styles.collateralLabel}>Estimated Value:</span>
                <span className={styles.collateralAmount}>0</span>
              </div>
              <div className={styles.collateralDesc}>
                Collateral must be equal to the requested loan amount, denominated in the selected cryptocurrency.
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default RequestLoan; 