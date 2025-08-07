import 'react-toastify/dist/ReactToastify.css'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import './styles/App.css'

import LandingPage from './pages/LandingPage'
import LoginRegisterPage from './pages/LoginRegisterPage'
import InterestTerms from './pages/InterestTerms'
import RequestLoan from './pages/RequestLoan'
import Dashboard from './pages/Dashboard'
import ViewLoans from './pages/ViewLoans'
import LoanDetails from './pages/LoanDetails'
import Cryptocurrencies from './pages/Cryptocurrencies'
import AdminDashboard from './pages/AdminDashboard'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import Wallet from './pages/Wallet'
import ViewDeals from './pages/ViewDeals'
import DealDetails from './pages/DealDetails'
import InterestCalculator from './pages/InterestCalculator'

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
        <Route path="/deals/:dealId" element={<DealDetails />} />
        <Route path="/cryptocurrencies" element={<Cryptocurrencies />} />
        <Route path="/interest-calculator" element={<InterestCalculator />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/suspicious-accounts" element={<AdminDashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/view-deals" element={<ViewDeals />} />
      </Routes>

      {/* Toast Container for notifications */}
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false} // Right to left display
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </div>
  );
}

export default App;
