import DashboardHeader from './DashboardHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';





function Users() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(tokenData.email);
            } catch (err) {
                console.error('Error parsing token:', err);
                setUserEmail('')
            }
        }
    }, []);



    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null)

                // Get stored user data
                const token = localStorage.getItem('token');
                const userEmail = localStorage.getItem('userEmail');
                const isAdmin = localStorage.getItem('isAdmin') === 'true';

                // Debug log to check token value
                console.log('Current auth state:', {
                    hasToken: !!token,
                    tokenValue: token,
                    isAdmin: isAdmin,
                    email: userEmail
                });

                if (!token || !isAdmin) {
                    console.log('Not authenticated or not admin:', { token: !!token, isAdmin });
                    navigate('/login');
                    return;
                }

                // Common headers for all requests
                const headers = {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                };

                // Debug log to check headers
                console.log('Request headers:', headers);


                // Try to fetch users data
                let usersData = [];
                try {
                    const usersRes = await fetch(`${BACKEND_URL}/admin/users`, {
                        headers,
                        credentials: 'include'
                    });

                    if (usersRes.ok) {
                        const incomingUsersData = await usersRes.json();
                        console.log('Users data fetched:', incomingUsersData);

                        // Transform the backend data to match our front end
                        usersData = incomingUsersData.map(user => ({
                            id: user._id,
                            email: user.email,
                            isAdmin: user.isAdmin,
                            isActive: user.isActive
                        }));

                        console.log('Processed users data', usersData)
                    } else {
                        console.log('User data not available at this time (Status:', usersRes.status, ')');
                        usersData = [
                            {
                                id: 1,
                                email: "tysonwilliams@hotmail.com",
                                isAdmin: false,
                                isActive: true
                            },
                            {
                                id: 2,
                                email: "adriangcodes@coder.com",
                                isAdmin: true,
                                isActive: true
                            }
                        ];
                    }

                } catch (err) {
                    console.log('Error fetching users:', err);
                    setError('Failed to fetch users data')
                };

                setUsers(usersData);

            } catch (err) {
                console.log('Error in fetchUsers:', err);
                setError('An error occurred while loading users')
            } finally {
                setLoading(false)
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className={styles.adminDashboard}>
                <DashboardHeader userEmail={userEmail} isAdmin={true} />
                <div className={styles.content}>
                    <div className={styles.loading}>Loading users...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={styles.adminDashboard}>
                <DashboardHeader userEmail={userEmail} isAdmin={true} />
                <div className={styles.content}>
                    <div className={styles.content}>Error: {error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.adminDashboard}>
            <DashboardHeader userEmail={userEmail} isAdmin={true} />
            <main className={styles.content}>

                <h1>All Registered Users</h1>
                <div className={styles.tableContainer}>
                    <h2>Users</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.loansTable}>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.email}</td>
                                        <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                                        <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                                        <td>
                                            <button className={styles.viewButton}>Edit</button>
                                            <button className={styles.deleteButton} style={{marginLeft: '8px'}}>
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>

                <button
                    className={styles.actionButton}
                    onClick={() => navigate('/admin-dashboard')}
                    style={{marginTop: '20px'}}
                >
                    <i className='fas fa-arrow-left'></i>
                    Back to Dashboard
                </button>
            </main>

        </div>
    );
}

export default Users;