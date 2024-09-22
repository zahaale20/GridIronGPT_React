import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Global.css';
import ChangeProfilePicture from './ChangeProfilePicture';

function ProfilePage() {
  const [userData, setUserData] = useState({});
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
          `${process.env.REACT_APP_BACKEND_LINK}/users/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        navigate('/login');
      }
    };
    fetchUserProfile();
  }, [navigate]);

  return (
    <div className="page-container">
      <div className="profile-card">
        <ChangeProfilePicture userID={userData.userID} time={new Date().getTime().toString()} />

        <p><strong>Full Name:</strong> {userData.fullName || 'User Name'}</p>
        <p><strong>Email:</strong> {userData.email || 'user@example.com'}</p>
        <p><strong>Phone:</strong> {userData.phoneNumber || 'Not provided'}</p>
        <p><strong>Username:</strong> {userData.username || 'username'}</p>
        
        <div className="profile-actions">
          <button onClick={() => navigate('/change-password')}>Change Password</button>
          <button onClick={() => {
            localStorage.removeItem(process.env.REACT_APP_JWT_TOKEN_NAME);
            navigate('/login');
          }}>Sign Out</button>
          <button onClick={() => setShowDeleteConfirmation(true)}>Delete Account</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
