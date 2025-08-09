import React, { useState, useEffect } from 'react';
import styles from '../styles/InterestCalculator.module.css';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import { toast } from 'react-toastify';

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

const InterestCalculator = () => {
  const [interestTerms, setInterestTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  
  // Calculator state
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          setUserEmail(tokenData.email);
        }

        const response = await fetch(`${BACKEND_URL}/interest-terms`, {
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
        
        // Set default term to first one
        if (data.length > 0) {
          setSelectedTerm(data[0]._id);
        }
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load interest terms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateInterest = () => {
    if (!loanAmount || !selectedTerm || isNaN(loanAmount) || parseFloat(loanAmount) <= 0) {
      toast.error('Please enter a valid loan amount and select a term');
      return;
    }

    const selectedTermData = interestTerms.find(term => term._id === selectedTerm);
    if (!selectedTermData) {
      toast.error('Please select a valid loan term');
      return;
    }

    const principal = parseFloat(loanAmount);
    const annualRate = selectedTermData.interest_rate / 100;
    const termInMonths = selectedTermData.loan_length;
    const termInYears = termInMonths / 12;

    // Simple interest calculation: A = P(1 + rt)
    const totalAmount = principal * (1 + (annualRate * termInYears));
    const totalInterest = totalAmount - principal;
    const monthlyInterest = totalInterest / termInMonths;
    const monthlyPayment = totalAmount / termInMonths;

    setCalculationResult({
      principal,
      interestRate: selectedTermData.interest_rate,
      termMonths: termInMonths,
      totalInterest: totalInterest.toFixed(8),
      totalAmount: totalAmount.toFixed(8),
      monthlyInterest: monthlyInterest.toFixed(8),
      monthlyPayment: monthlyPayment.toFixed(8)
    });
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setCalculationResult(null);
    if (interestTerms.length > 0) {
      setSelectedTerm(interestTerms[0]._id);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} />
        <div className={styles.loading}>Loading interest calculator...</div>
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
          <h1 className={styles.title}>Interest Calculator</h1>
          
          <div className={styles.calculatorContainer}>
            <div className={styles.inputSection}>
              <h2 className={styles.sectionTitle}>Loan Details</h2>
              
              <div className={styles.inputGroup}>
                <label htmlFor="loanAmount" className={styles.label}>
                  Loan Amount (BTC)
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="loanAmount"
                    value={loanAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      
                      // Allow empty input
                      if (value === '') {
                        setLoanAmount('');
                        return;
                      }
                      
                      // Allow only numbers and decimal point
                      const numericRegex = /^[0-9]*\.?[0-9]*$/;
                      if (!numericRegex.test(value)) {
                        return; // Don't update if invalid characters
                      }
                      
                      // If it's a valid number, format it to prevent scientific notation
                      if (!isNaN(value) && value !== '.') {
                        const num = parseFloat(value);
                        if (num >= 0) {
                          setLoanAmount(value); // Keep the user's input as-is while typing
                        }
                      } else if (value === '.' || value.endsWith('.')) {
                        setLoanAmount(value); // Allow decimal point while typing
                      }
                    }}
                    onBlur={(e) => {
                      // Format the final value on blur
                      const value = e.target.value;
                      if (value && !isNaN(value) && value !== '.') {
                        const num = parseFloat(value);
                        if (num > 0) {
                          const formatted = num.toFixed(8).replace(/\.?0+$/, '');
                          setLoanAmount(formatted);
                        } else if (num === 0) {
                          setLoanAmount('0');
                        }
                      } else if (value === '.' || value === '') {
                        setLoanAmount('');
                      }
                    }}
                    placeholder="Enter loan amount in BTC (e.g., 0.001)"
                    className={styles.input}
                  />
                  <div className={styles.inputButtons}>
                    <button
                      type="button"
                      className={styles.inputButton}
                      onClick={() => {
                        const current = parseFloat(loanAmount) || 0;
                        const newValue = current + 0.00000001;
                        const formatted = newValue.toFixed(8).replace(/\.?0+$/, '');
                        setLoanAmount(formatted);
                      }}
                    >
                      <i className="fas fa-chevron-up"></i>
                    </button>
                    <button
                      type="button"
                      className={styles.inputButton}
                      onClick={() => {
                        const current = parseFloat(loanAmount) || 0;
                        const newValue = Math.max(0, current - 0.00000001);
                        const formatted = newValue === 0 ? '0' : newValue.toFixed(8).replace(/\.?0+$/, '');
                        setLoanAmount(formatted);
                      }}
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="loanTerm" className={styles.label}>
                  Loan Term
                </label>
                <select
                  id="loanTerm"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className={styles.select}
                >
                  {interestTerms
                    .sort((a, b) => a.loan_length - b.loan_length)
                    .map((term) => (
                      <option key={term._id} value={term._id}>
                        {term.loan_length} month{term.loan_length > 1 ? 's' : ''} - {term.interest_rate.toFixed(1)}% p.a.
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.buttonGroup}>
                <button 
                  onClick={calculateInterest} 
                  className={`${styles.button} ${styles.primary}`}
                >
                  <i className="fas fa-calculator"></i>
                  Calculate Interest
                </button>
                <button 
                  onClick={resetCalculator} 
                  className={`${styles.button} ${styles.secondary}`}
                >
                  <i className="fas fa-refresh"></i>
                  Reset
                </button>
              </div>
            </div>

            {calculationResult && (
              <div className={styles.resultsSection}>
                <h2 className={styles.sectionTitle}>Calculation Results</h2>
                
                <div className={styles.resultsGrid}>
                  <div className={styles.resultCard}>
                    <div className={styles.resultLabel}>Principal Amount</div>
                    <div className={styles.resultValue}>
                      {calculationResult.principal.toFixed(8)} BTC
                    </div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultLabel}>Interest Rate</div>
                    <div className={styles.resultValue}>
                      {calculationResult.interestRate.toFixed(1)}% p.a.
                    </div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultLabel}>Loan Term</div>
                    <div className={styles.resultValue}>
                      {calculationResult.termMonths} months
                    </div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultLabel}>Total Interest</div>
                    <div className={`${styles.resultValue} ${styles.highlight}`}>
                      {calculationResult.totalInterest} BTC
                    </div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultLabel}>Total Repayment</div>
                    <div className={`${styles.resultValue} ${styles.highlight}`}>
                      {calculationResult.totalAmount} BTC
                    </div>
                  </div>

                  <div className={styles.resultCard}>
                    <div className={styles.resultLabel}>Monthly Interest</div>
                    <div className={styles.resultValue}>
                      {calculationResult.monthlyInterest} BTC
                    </div>
                  </div>
                </div>

                <div className={styles.summaryCard}>
                  <h3 className={styles.summaryTitle}>
                    <i className="fas fa-info-circle"></i>
                    Payment Summary
                  </h3>
                  <p className={styles.summaryText}>
                    For a loan of <strong>{calculationResult.principal.toFixed(8)} BTC</strong> over{' '}
                    <strong>{calculationResult.termMonths} months</strong> at{' '}
                    <strong>{calculationResult.interestRate.toFixed(1)}% p.a.</strong>, you will pay{' '}
                    <strong>{calculationResult.monthlyPayment} BTC per month</strong> for a total repayment of{' '}
                    <strong>{calculationResult.totalAmount} BTC</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.note}>
            <i className="fas fa-exclamation-triangle"></i>
            This calculator uses simple interest calculation for demonstration purposes. 
            Actual loan terms may vary and are subject to approval.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterestCalculator;
