import React, { useEffect, useState } from 'react';
import styles from './ViewLoans.module.css';
import { default as DashboardHeader } from './DashboardHeader';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';

const columns = [
  { key: 'user', label: 'User' },
  { key: 'currency', label: 'Currency' },
  { key: 'amount', label: 'Amount' },
  { key: 'term', label: 'Term' },
  { key: 'expiry', label: 'Expiry' },
];

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

const ViewLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('user');
  const [sortDir, setSortDir] = useState('asc');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Extract user email from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(tokenData.email);
      } catch {
        setUserEmail('');
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const loansRes = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/loan-requests', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          credentials: 'include',
          mode: 'cors',
        });
        if (!loansRes.ok) throw new Error('Failed to fetch loans');
        const loans = await loansRes.json();
        // Filter to only show pending loans
        const pendingLoans = loans.filter(loan => loan.status === 'pending');
        setLoans(pendingLoans);
      } catch (err) {
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare rows for sorting
  const rows = loans.map(loan => {
    let user = '';
    if (loan.borrower_id?.name) {
      user = maskName(loan.borrower_id.name);
    } else if (loan.borrower_id?.email) {
      user = maskEmail(loan.borrower_id.email);
    } else {
      user = 'User';
    }
    return {
      id: loan._id,
      user,
      currency: loan.cryptocurrency ? `${loan.cryptocurrency.name} (${loan.cryptocurrency.symbol})` : '',
      amount: loan.request_amount,
      term: loan.interest_term
        ? `${loan.interest_term.loan_length} month${loan.interest_term.loan_length > 1 ? 's' : ''} / ${loan.interest_term.interest_rate}%`
        : '',
      expiry: loan.expiry_date ? new Date(loan.expiry_date).toLocaleDateString() : '',
      status: loan.status || 'pending',
      learnMore: loan,
      _raw: loan,
    };
  });

  // Sorting logic
  const sortedRows = [...rows].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    if (sortBy === 'amount') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    } else if (sortBy === 'expiry') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = aVal?.toString().toLowerCase();
      bVal = bVal?.toString().toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const sortArrow = (col) => {
    if (sortBy !== col) return <span className={styles.sortArrow}></span>;
    return <span className={styles.sortArrow}>{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Get userEmail from localStorage for the header
  const userEmailFromStorage = localStorage.getItem('userEmail');

  if (!userEmailFromStorage) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.loading}>Loading loans...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.error}>Error: {error}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />
      <main className={styles.main}>
        <div className={styles.content}>
          <h1 className={styles.title}>Browse Loan Requests</h1>

          <div className={styles.tableWrapper}>
            <table className={styles.loansTable}>
              <thead>
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className={styles.sortable}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}{sortArrow(col.key)}
                    </th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(row => (
                  <tr key={row.id}>
                    <td>{row.user}</td>
                    <td>{row.currency}</td>
                    <td>{row.amount}</td>
                    <td>{row.term}</td>
                    <td>{row.expiry}</td>
                    <td>
                      <button
                        className={styles.learnMoreBtn}
                        onClick={() => navigate(`/view-loans/${row.id}`)}
                      >
                        Learn More
                      </button>
                    </td>
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

export default ViewLoans;