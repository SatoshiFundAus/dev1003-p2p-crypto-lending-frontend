import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './LoginRegisterPage.module.css'

function Login(props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const loginData = {
            email: email.trim(),
            password: password.trim()
        };

        console.log('Sending login data:', loginData);

        try {
            const response = await fetch('https://dev1003-p2p-crypto-lending-backend.onrender.com/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors',
                body: JSON.stringify(loginData)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                // Store the token in localStorage
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                // Show success toast
                toast.success('Login Successful', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Redirect to dashboard or home page after a short delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                setError(data.message || 'Login failed. Please check your credentials.');
                console.error('Login failed:', data);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Login failed. Please try again.')
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
            </form>
        </>
    );
}

export default Login