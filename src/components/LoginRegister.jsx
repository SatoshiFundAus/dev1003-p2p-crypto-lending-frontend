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

        console.log('Sending request to:', endpoint);
        console.log('With data:', userData);

        try {
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
            console.log('Response data:', data);

            if (response.ok) {
                if (isRegistration) {
                    // Show registration success toast
                    toast.success('Account Successfully Registered', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    // Redirect to login after a short delay
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    // Handle login success
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                    toast.success('Login Successful', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 1000);
                }
            } else {
                setError(data.message || `${isRegistration ? 'Registration' : 'Login'} failed. Please try again.`);
                console.error(`${isRegistration ? 'Registration' : 'Login'} failed:`, data);
            }
        } catch (err) {
            console.error(`${isRegistration ? 'Registration' : 'Login'} error:`, err);
            setError(`${isRegistration ? 'Registration' : 'Login'} failed. Please try again.`)
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