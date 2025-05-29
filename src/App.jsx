import { Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginRegisterPage from './components/LoginRegisterPage';
import InterestTerms from './components/InterestTerms';
import RequestLoan from './components/RequestLoan';
import Dashboard from './components/Dashboard';
import ViewLoans from './components/ViewLoans';
import LoanDetails from './components/LoanDetails';
import Cryptocurrencies from './components/Cryptocurrencies';
import AdminDashboard from './components/AdminDashboard';
import Transactions from './components/Transactions';
import Users from './components/Users';
import Wallet from './components/Wallet';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginRegisterPage name="Log In" />} />
        <Route path="/register" element={<LoginRegisterPage name="Register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interest-terms" element={<InterestTerms />} />
        <Route path="/request-loan" element={<RequestLoan />} />
        <Route path="/view-loans" element={<ViewLoans />} />
        <Route path="/view-loans/:loanId" element={<LoanDetails />} />
        <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/suspicious-accounts" element={<AdminDashboard />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </div>
  );
}

export default App;
