import './Footer.css'

function Footer() {
    return (
        <footer className="footer">
            
            <div className="social-icons">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <i className="fab fa-twitter"></i>
                </a>
                <a href="https://github.com/SatoshiFundAus" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <i className="fab fa-github"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <i className="fab fa-linkedin-in"></i>
                </a>
            </div>
        </footer>
    );
}

export default Footer