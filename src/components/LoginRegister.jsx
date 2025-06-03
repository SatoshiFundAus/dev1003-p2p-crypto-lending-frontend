import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './LoginRegisterPage.module.css'

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
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
            console.log('Request headers:', {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            });
            
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
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
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
                        hasToken: Boolean(data.token)
                    });

                    // Store user data in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('isAdmin', data.isAdmin);

                    // Verify stored data
                    console.log('Stored data verification:', {
                        storedEmail: localStorage.getItem('userEmail'),
                        storedIsAdmin: localStorage.getItem('isAdmin'),
                        hasStoredToken: Boolean(localStorage.getItem('token'))
                    });

                    // Redirect based on user role
                    const isAdminUser = data.isAdmin === true;
                    console.log('Navigation decision:', {
                        isAdmin: isAdminUser,
                        destination: isAdminUser ? '/admin-dashboard' : '/dashboard'
                    });

                    toast.success('Login Successful', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });

                    setTimeout(() => {
                        navigate(isAdminUser ? '/admin-dashboard' : '/dashboard');
                    }, 1000);
                } else {
                    throw new Error('No token received from server');
                }
            } else {
                // Handle error responses (including 404 for invalid credentials)
                let errorMessage;
                
                if (response.status === 404 && data.error) {
                    // Backend returns 404 for invalid credentials
                    errorMessage = data.error;
                } else if (response.status === 401) {
                    // Standard unauthorized response
                    errorMessage = 'Invalid email or password. Please try again.';
                } else if (response.status >= 500) {
                    // Server error
                    errorMessage = 'Server error. Please try again later.';
                } else if (data.error && data.error.includes('E11000')) {
                    // MongoDB duplicate key error
                    errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
                } else {
                    // Other errors
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
                    className={styles.input}
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label className={styles.label} htmlFor="password">Password:</label>
                <input
                    className={styles.input}
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

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
        </>
    );
}

export default Login