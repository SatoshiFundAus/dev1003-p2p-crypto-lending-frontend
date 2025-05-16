import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';


function App() {

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<App />} />
          <Route path="/lend" element={<App />} />
        </Routes>
      </BrowserRouter>
    </div>

  )
}

export default App
