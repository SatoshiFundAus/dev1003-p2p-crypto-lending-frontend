import { useState } from "react";

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
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: 'auto' }}>
            <h2>Login</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

            <label htmlFor="email">Email:</label>
            <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
            />

            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
            />

            <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );

}

export default Login