import DashboardHeader from './DashboardHeader';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { toast } from 'react-toastify';

const BACKEND_URL = 'https://dev1003-p2p-crypto-lending-backend.onrender.com';

function Users() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editUserModal, setEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({
        email: '',
        isAdmin: false,
        isActive: true
    });
    const [updating, setUpdating] = useState(false);

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

                if (!token || !isAdmin) {
                    console.log('Not authenticated or not admin:', { token: !!token, isAdmin });
                    toast.error('Not authenticated, redirecting')
                    navigate('/login');
                    return;
                }

                // Common headers for all requests
                const headers = {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                };

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
                        usersData = incomingUsersData.map((user, index) => {
                            return {
                                id: user.userId || user._id || user.id || user.email || `user-${index}`,
                                email: user.email,
                                isAdmin: user.isAdmin,
                                isActive: user.isActive
                            };
                        });

                        console.log('Processed users data', usersData)
                    } else {
                        console.log('User data not available at this time (Status:', usersRes.status, ')');
                        usersData = [
                            {
                                id: 1,
                                email: "bananamuffins@coder.com",
                                isAdmin: false,
                                isActive: true
                            },
                            {
                                id: 2,
                                email: "carrotcake@coder.com",
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
    }, [navigate]);

    const handleEditClick = (userId) => {
        // Find the user to edit
        const userToEdit = users.find(user => user.id === userId);
        if (userToEdit) {
            setEditingUser(userToEdit);
            setEditForm({
                email: userToEdit.email,
                isAdmin: userToEdit.isAdmin,
                isActive: userToEdit.isActive
            });
            setEditUserModal(true);
        } else {
            toast.error('User not found')
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editingUser) {
            toast.error("No user selected for editing");
            return;
        }

        // Validate email
        if (!editForm.email || !editForm.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return
        }

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const isAdmin = localStorage.getItem('isAdmin') === 'true';

            if (!token || !isAdmin) {
                toast.error('Not authenticated or not admin. Redirecting');
                navigate('/login');
                return;
            }

            // Check if admin is trying to remove their own admin status
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const currentUserId = tokenData.id;

                if (currentUserId === editingUser.id && !editForm.isAdmin) {
                    toast.error('You cannot remove your own admin privileges');
                    return;
                }
            } catch (tokenError) {
                console.error('Error parsing token:', tokenError)
            }

            const response = await fetch(`${BACKEND_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: editForm.email,
                    isAdmin: editForm.isAdmin,
                    isActive: editForm.isActive
                })
            });

            if (response.ok) {
                const updatedUser = await response.json();

                //Update the user in local state
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.id === editingUser.id
                            ? { ...user, ...editForm }
                            : user
                    )
                );

                toast.success('User updated successfully');
                closeModal();

            } else if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
                toast.error('Session expired. Please log in again');
                navigate('/login')

            } else if (response.status === 403) {
                toast.error('You do not have permission to edit users')

            } else if (response.status === 404) {
                toast.error('User not found')

            } else if (response.status === 409) {
                toast.error('Email already exists')

            } else {
                const errorData = await response.json()
                toast.error(errorData.error || 'Failed to update user')
            }


        } catch (err) {
            console.error('Update user failed:', err)
            toast.error('An error occurred while updated the user')

        } finally {
            setUpdating(false);
        }
    }

    const handleDeleteClick = async (userId) => {
        try {

            if (!userId) {
                toast.error('Invalid user ID');
                return;
            }

            // Get token for authentication
            const token = localStorage.getItem('token')
            const isAdmin = localStorage.getItem('isAdmin') === 'true';


            if (!token || !isAdmin) {
                toast.error('Not authenticated or not admin. Redirecting to login');
                navigate('/login')
                return;
            }

            // First check if the user is trying to delete themselves
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const currentUserId = tokenData.id;

                if (currentUserId === userId) {
                    toast.error('You cannot delete your own account');
                    return;
                }
            } catch (tokenError) {
                console.error('Error parsing token:', tokenError);

                // If we can't parse the token for whatever reason, we'll fall back to email comparison
                const currentUserEmail = localStorage.getItem('userEmail');
                const userToDelete = users.find(user => user.id === userId);

                if (userToDelete && userToDelete.email === currentUserEmail) {
                    toast.error('You cannot delete your own account');
                    return
                }
            }

            // Confirm deletion
            if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone')) {
                return;
            }

            //Send DELETE request with the user ID
            const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                // Remove the user from the local state
                setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
                toast.success('User deleted successfully');

            } else if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
                toast.error('Session expired. Please log in again');
                navigate('/login')

            } else if (response.status === 403) {
                toast.error('You do not have permission to delete users')

            } else if (response.status === 404) {
                toast.error("User not found");

            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to delete user');
            }


        } catch (err) {
            console.error('Delete user failed: ', err)
            toast.error('An error occured while deleting the user');
        }
    }

    const closeModal = () => {
        setEditUserModal(false);
        setEditingUser(null);
        setEditForm({
            email: '',
            isAdmin: false,
            isActive: true
        });
    };

    const handleInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

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
                                {users.map((user, index) => {
                                    const userKey = user.id || user.email || `user-${index}`;

                                    return (
                                        <tr key={userKey}>
                                            <td>{user.email}</td>
                                            <td>{user.isAdmin ? 'Admin' : 'User'}</td>
                                            <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                                            <td>
                                                <button
                                                    className={styles.viewButton}
                                                    onClick={() => handleEditClick(user.id)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    style={{ marginLeft: '8px' }}
                                                    onClick={() => handleDeleteClick(user.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Edit User Modal */}
                {editUserModal && editingUser && (
                    <div className={styles.modalOverlay} onClick={closeModal}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>Edit User: {editingUser.email}</h3>
                                <button
                                    className={styles.closeButton}
                                    onClick={closeModal}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="editEmail">Email Address</label>
                                    <input
                                        type="email"
                                        id="editEmail"
                                        value={editForm.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                        className={styles.formInput}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isAdmin}
                                            onChange={(e) => handleInputChange('isAdmin', e.target.checked)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkboxText}>Admin Privileges</span>
                                    </label>
                                    <small className={styles.helpText}>
                                        Grant this user administrative access to the system
                                    </small>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={editForm.isActive}
                                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                            className={styles.checkbox}
                                        />
                                        <span className={styles.checkboxText}>Active Account</span>
                                    </label>
                                    <small className={styles.helpText}>
                                        Deactivated users cannot log in to the system
                                    </small>
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={`${styles.actionButton} ${styles.secondary}`}
                                        disabled={updating}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className={`${styles.actionButton} ${styles.primary}`}
                                    >
                                        {updating ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save"></i>
                                                Update User
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <button
                    className={styles.actionButton}
                    onClick={() => navigate('/admin-dashboard')}
                    style={{ marginTop: '20px' }}
                >
                    <i className='fas fa-arrow-left'></i>
                    Back to Dashboard
                </button>
            </main>

        </div>
    );
}

export default Users;