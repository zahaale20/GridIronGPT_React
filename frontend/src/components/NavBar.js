import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import logoImage from '../assets/gridiron_gpt_secondary_light.png';
import questionMarkIcon from '../assets/question_mark_icon.png';
import { FaUserCircle } from 'react-icons/fa';

import './NavBar.css';
import '../style/Theme.css'; 

function NavBar() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleMouseEnter = (event) => {
        const buttons = document.querySelectorAll('.nav-button');
        buttons.forEach(button => {
            if (button !== event.target) {
                button.style.color = 'lightgray';
                button.style.background = 'none';
            } else {
                button.style.color = '#2d2c2b';
                button.style.background = 'none';
            }
        });
    };

    const handleMouseLeave = () => {
        const buttons = document.querySelectorAll('.nav-button');
        buttons.forEach(button => {
            button.style.color = '#2d2c2b';
            button.style.background = 'none';
        });
    };

    const handleProfileNavigation = () => {
        const token = localStorage.getItem(process.env.REACT_APP_JWT_TOKEN_NAME);
        if (token) {
            navigate('/profile');
        } else {
            navigate('/login');
        }
    };

    return (
        <nav className="nav">
            <div className="top-row">
                <Link to="/" className="logo-link">
                    <img className="logo-image" src={logoImage} style={{ marginTop: '8px' }} alt="GridIron GPT Logo" />
                </Link>

                <div className="top-row-icons">
                    <img className="icon-image" src={questionMarkIcon} alt="Help" />
                    <div className="profile-icon-container" onClick={handleProfileNavigation}>
                        <FaUserCircle className="profile-icon" />
                    </div>
                </div>
            </div>
            <div className="bottom-row">
                <button className="nav-button" onClick={() => handleNavigation('/')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>HOME</button>
                <button className="nav-button" onClick={() => handleNavigation('/fantasy')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>FANTASY DRAFT</button>
                <button className="nav-button" onClick={() => handleNavigation('/trade')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>TRADE ANALYZER</button>
                <button className="nav-button" onClick={() => handleNavigation('/rankings')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>RANKINGS</button>
                <button className="nav-button" onClick={() => handleNavigation('/matchups')} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>MATCHUPS</button>
            </div>
        </nav>
    );
}

export default NavBar;
