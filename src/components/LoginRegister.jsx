import { useState } from "react";
import styles from './LoginRegisterPage.module.css'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Example: Call your login API here
            // const response = await loginApi({ email, password })
            // if (response.success) {
            //  // Redirect or update auth state
            // } else {
            //  setError('Invalid credentials')
            // }

            // For now simulating a login
            console.log("Logging in with ", email, password);
            setLoading(false);
        } catch (err) {
            setError('Login failed. Please try again.')
            setLoading(false)
        }
    }



    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h2 className={styles.heading}>Log In</h2>
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
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );

}

export default Login