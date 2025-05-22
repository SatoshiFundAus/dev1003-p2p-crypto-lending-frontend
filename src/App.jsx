import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import LoginRegisterPage from './components/LoginRegisterPage';
import Login from './components/LoginRegister';
import Header from './components/Header';
import InterestTerms from './components/InterestTerms';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRegisterPage name="Log In" />} />
          <Route path="/register" element={<LoginRegisterPage name="Register" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lend" element={<App />} />
          <Route path="/interest-terms" element={<InterestTerms />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
