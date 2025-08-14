import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../styles/LoginRegisterPage.module.css'

// Tutorial Modal Component (Note: Capital T for TutorialModal)
function TutorialModal({ isOpen, onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    const tutorialSteps = [
        {
            title: "Welcome to SatoshiFund! 🎉",
            content: "We're excited to have you join our crypto lending platform. Let's take a quick tour to get you started.",
            icon: "🚀"
        },
        {
            title: "Dashboard Overview",
            content: "Your dashboard shows your loan statistics, wallet balance, and quick actions. This is your central hub for managing your crypto lending activities.",
            icon: "📊"
        },
        {
            title: "Request a Loan",
            content: "Need crypto? Use 'Request Loan' to borrow against your cryptocurrency collateral. Set your terms and amount, and connect with lenders.",
            icon: "💰"
        },
        {
            title: "View Available Loans",
            content: "Want to lend? Browse 'View Loans' to see borrowing requests from other users. Choose loans that match your risk tolerance and return expectations.",
            icon: "👀"
        },
        {
            title: "Manage Your Wallet",
            content: "Your wallet shows your crypto balances and transaction history. Keep track of your deposits, withdrawals, and loan activities.",
            icon: "👛"
        },
        {
            title: "You're All Set! ✨",
            content: "You're ready to start your crypto lending journey. Remember to always review terms carefully and never invest more than you can afford to lose.",
            icon: "🎯"
        }
    ];

    const nextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipTutorial = () => {
        onClose();
    };

    if (!isOpen) return null;

    const currentStepData = tutorialSteps[currentStep];

    return (
        <div className={styles.tutorialOverlay}>
            <div className={styles.tutorialModal}>
                <div className={styles.tutorialHeader}>
                    <span className={styles.tutorialIcon}>{currentStepData.icon}</span>
                    <h2 className={styles.tutorialTitle}>{currentStepData.title}</h2>
                    <button className={styles.tutorialCloseBtn} onClick={skipTutorial}>
                        ×
                    </button>
                </div>

                <div className={styles.tutorialContent}>
                    <p>{currentStepData.content}</p>
                </div>

                <div className={styles.tutorialFooter}>
                    <div className={styles.tutorialProgress}>
                        <span>{currentStep + 1} of {tutorialSteps.length}</span>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.tutorialButtons}>
                        <button
                            className={styles.tutorialBtnSecondary}
                            onClick={skipTutorial}
                        >
                            Skip Tutorial
                        </button>

                        {currentStep > 0 && (
                            <button
                                className={styles.tutorialBtnSecondary}
                                onClick={prevStep}
                            >
                                Previous
                            </button>
                        )}

                        <button
                            className={styles.tutorialBtnPrimary}
                            onClick={nextStep}
                        >
                            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const handleTutorialComplete = () => {
        console.log('Tutorial completed');
        setShowTutorial(false);
        if (pendingNavigation) {
            navigate(pendingNavigation);
            setPendingNavigation(null);
        }
    };

    const handleTutorialClose = () => {
        console.log('Tutorial closed/skipped');
        setShowTutorial(false);
        if (pendingNavigation) {
            navigate(pendingNavigation);
            setPendingNavigation(null);
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[A-Z])/.test(password)) {
            errors.password = 'Password must include at least one uppercase letter';
        } else if (!/(?=.*[a-z])/.test(password)) {
            errors.password = 'Password must include at least one lowercase letter';
        } else if (!/(?=.*\d)/.test(password)) {
            errors.password = 'Password must include at least one number';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setValidationErrors({});
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const userData = {
            email: email.trim(),
            password: password.trim()
        };

        const isRegistration = props.name === "Register";
        const endpoint = `https://dev1003-p2p-crypto-lending-backend.onrender.com/${isRegistration ? 'register' : 'login'}`;

        try {
            console.log('Sending request with data:', { ...userData, password: '***' });
            console.log('Request endpoint:', endpoint);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(userData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Full response data:', data);

            if (response.ok) {
                if (isRegistration) {
                    toast.success('Account Successfully Registered', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else if (data.token) {
                    // Handle login success
                    console.log('Processing login data:', {
                        email: data.email,
                        isAdmin: data.isAdmin,
                        isFirstLogin: data.isFirstLogin, // Add this debug log
                        hasToken: Boolean(data.token)
                    });

                    // Store user data in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('isAdmin', data.isAdmin);

                    // Determine navigation destination
                    const isAdminUser = data.isAdmin === true;
                    const destination = isAdminUser ? '/admin-dashboard' : '/dashboard';
                    
                    console.log('Navigation decision:', {
                        isAdmin: isAdminUser,
                        isFirstLogin: data.isFirstLogin,
                        destination: destination,
                        shouldShowTutorial: data.isFirstLogin && !isAdminUser
                    });

                    toast.success('Login Successful', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });

                    // Check if this is a first login for regular users (not admins)
                    if (data.isFirstLogin && !isAdminUser) {
                        console.log('Showing tutorial for first-time user');
                        // Show tutorial for first-time users
                        setPendingNavigation(destination);
                        setShowTutorial(true);
                    } else {
                        console.log('Navigating immediately - not first login or admin user');
                        // Navigate immediately for returning users or admins
                        setTimeout(() => {
                            navigate(destination);
                        }, 1000);
                    }
                } else {
                    throw new Error('No token received from server');
                }
            } else {
                // Handle error responses
                let errorMessage;
                
                if (response.status === 404 && data.error) {
                    errorMessage = data.error;
                } else if (response.status === 401) {
                    errorMessage = 'Invalid email or password. Please try again.';
                } else if (response.status >= 500) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (data.error && data.error.includes('E11000')) {
                    errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
                } else if (data.error && data.error.includes('User validation failed')) {
                    // Handle validation errors from the server
                    const validationError = data.error;
                    if (validationError.includes('email')) {
                        setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                    }
                    if (validationError.includes('password')) {
                        setValidationErrors(prev => ({ ...prev, password: 'Password must include upper/lowercase letters and a number' }));
                    }
                    errorMessage = 'Please fix the validation errors above';
                } else {
                    errorMessage = data.error || data.message || `${isRegistration ? 'Registration' : 'Login'} failed. Please try again.`;
                }
                
                console.error('Error response:', {
                    status: response.status,
                    error: errorMessage,
                    data: data
                });
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Request error details:', {
                name: err.name,
                message: err.message,
                stack: err.stack
            });
            
            let errorMessage;
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMessage = `${isRegistration ? 'Registration' : 'Login'} failed. Network error - please check your internet connection and try again.`;
            } else if (err.message.includes('CORS')) {
                errorMessage = `${isRegistration ? 'Registration' : 'Login'} failed. Cross-origin request blocked.`;
            } else {
                errorMessage = `${isRegistration ? 'Registration' : 'Login'} failed. ${err.message}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <h2 className={styles.heading}>{props.name}</h2>
                {error && <div className={styles.error}>{error}</div>}

                <label className={styles.label} htmlFor="email">Email:</label>
                <input
                    className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {validationErrors.email && (
                    <div className={styles.validationError}>{validationErrors.email}</div>
                )}

                <label className={styles.label} htmlFor="password">Password:</label>
                <input
                    className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {validationErrors.password && (
                    <div className={styles.validationError}>{validationErrors.password}</div>
                )}

                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading}
                >
                    {loading ? 'Working...' : `${props.name}`}
                </button>

                <div className={styles.registerLink}>
                    {props.name === "Log In" ? (
                        <>Not already a user? <Link to="/register">Register here</Link></>
                    ) : (
                        <>Already registered? <Link to="/login">Login here</Link></>
                    )}
                </div>
            </form>

            {/* Add the TutorialModal component here */}
            <TutorialModal 
                isOpen={showTutorial}
                onClose={handleTutorialClose}
                onComplete={handleTutorialComplete}
            />
        </>
    );
}

export default Login