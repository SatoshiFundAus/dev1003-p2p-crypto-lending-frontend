import './App.css';
import satoshiFund from './assets/satoshiFund.png';

function App() {

  return (
    <div className="App">
      <header className="navbar">
        <img src={satoshiFund} alt="logo" id='logo' />
        <button className='login-btn'>Login</button>
      </header>

      <main className="main-content">
        <div id='hero-text'>
          <h1>Borrow or Lend Bitcoin Securely. Instantly.</h1>
          <p>A decentralized peer-to-peer platform empowering users to lend or borrow Bitcoin without banks</p>
        </div>
        
        <div id='landing-page-btns'>
          <button className='btn btn-primary'>Borrow BTC</button>
          <button className='btn btn-secondary'>Lend BTC</button>
        </div>


      </main>

    </div>


  )
}

export default App
