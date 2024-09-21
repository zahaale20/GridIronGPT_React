import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Global.css';
import defaultHeadshot from '../../assets/default-headshot.png';

function ProfilePage() {
  const [userData, setUserData] = useState({});
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] = useState({
    username: '',
    password: ''
  });
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem(process.env.REACT_APP_JWT_TOKEN_NAME);
            if (!token) {
            navigate('/login');
            return;
            }
        
            try {
            const response = await axios.get(
                process.env.REACT_APP_BACKEND_LINK + '/users/profile',
                {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                }
            );
            setUserData(response.data);
            } catch (error) {
            console.error('Failed to fetch profile data:', error);
            navigate('/login');
            }
        };

        fetchUserProfile();
  }, []);

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const handleSignOut = () => {
    localStorage.removeItem(process.env.REACT_APP_JWT_TOKEN_NAME);
    navigate('/login');
  };

  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
  };

  const handleDeleteConfirmation = async () => {
    const token = localStorage.getItem(process.env.REACT_APP_JWT_TOKEN_NAME);
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(
        process.env.REACT_APP_BACKEND_LINK + '/users/delete',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            username: deleteConfirmationData.username,
            password: deleteConfirmationData.password,
          },
        }
      );

      if (response.status === 200) {
        localStorage.removeItem(process.env.REACT_APP_JWT_TOKEN_NAME);
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to delete profile:', error.response);
      if (error.response && error.response.data && error.response.data.error) {
        setDeleteError(error.response.data.error);
      } else {
        setDeleteError('An error occurred while deleting the profile.');
      }
    }
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteError('');
  };

  const handleDelete = (e) => {
    e.preventDefault();
    handleDeleteConfirmation();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteConfirmationData({ ...deleteConfirmationData, [name]: value });
  };

  return (
    <div className="page-container">
      <div className="profile-card">
        <p><strong>Full Name:</strong> {userData.fullName || 'User Name'}</p>
        <p><strong>Email:</strong> {userData.email || 'user@example.com'}</p>
        <p><strong>Phone:</strong> {formatPhoneNumber(userData.phoneNumber || 'Not provided')}</p>
        <p><strong>Username:</strong> {userData.username || 'username'}</p>

        <div className="profile-actions">
          <button onClick={handleChangePassword}>Change Password</button>
          <button onClick={handleSignOut}>Sign Out</button>
          <button onClick={confirmDelete}>Delete Account</button>
        </div>
      </div>

      {showDeleteConfirmation && (
        <div className="delete-confirmation">
          <h3>Confirm Account Deletion</h3>
          {deleteError && <p className="error-message">{deleteError}</p>}
          <form onSubmit={handleDelete}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={deleteConfirmationData.username}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={deleteConfirmationData.password}
              onChange={handleInputChange}
              required
            />
            <div className="confirmation-actions">
              <button type="submit">Confirm Delete</button>
              <button type="button" onClick={handleCancelDelete}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
