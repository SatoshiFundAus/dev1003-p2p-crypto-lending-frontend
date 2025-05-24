import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
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
                        hasToken: Boolean(data.token)
                    });

                    // Store user data in localStorage
                    localStorage.setItem('token', `Bearer ${data.token}`);
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
                const errorMessage = data.error || data.message || `${isRegistration ? 'Registration' : 'Login'} failed. Please try again.`;
                console.error('Error response:', {
                    status: response.status,
                    error: errorMessage,
                    data: data
                });
                setError(errorMessage);
            }
        } catch (err) {
            console.error('Request error:', err);
            setError(`${isRegistration ? 'Registration' : 'Login'} failed. ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <ToastContainer />
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