import React from 'react';
import {useNavigate} from 'react-router-dom';
import './LeftColumn.css'; // Linking the CSS file for styling

function LeftColumn() {
    const navigate = useNavigate();

    const handleCreateAccount = (event) => {
        navigate('/signup');
    }

    const handleLogin = (event) => {
        navigate('/login');
    }

    return (
        <div className="left-col">
            <div className="user-auth">
                <button className="auth-button" onClick={handleCreateAccount}>Create Account</button>
                <button className="auth-button" onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default LeftColumn;