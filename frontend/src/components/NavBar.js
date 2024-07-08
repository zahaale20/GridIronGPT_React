import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/gridirongpt_logo.png';
import questionMarkIcon from '../assets/question_mark_icon.png';
import profileIcon from '../assets/profile_icon_normal.png';
import './NavBar.css';
import '../style/Theme.css'; 

function NavBar() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <nav className="nav">
            <div className="top-row">
                <Link to="/" className="logo-link">
                    <img className="logo-image" src={logoImage} style = {{marginTop: '8px'}} alt="GridIron GPT Logo" />
                </Link>
                <div className="top-row-icons">
                    <img className="icon-image" src={questionMarkIcon} alt="Help" />
                    <img className="icon-image" src={profileIcon} alt="Profile" />
                </div>
            </div>
            <div className="bottom-row">
                {/* Navigation buttons */}
                <button className="nav-button" onClick={() => handleNavigation('/')}>HOME</button>
                <button className="nav-button" onClick={() => handleNavigation('/schedules')}>SCHEDULES</button>
                <button className="nav-button" onClick={() => handleNavigation('/standings')}>STANDINGS</button>
                <button className="nav-button" onClick={() => handleNavigation('/depth-chart')}>DEPTH CHARTS</button>
                <button className="nav-button" onClick={() => handleNavigation('/stats')}>STATS</button>
                <button className="nav-button" onClick={() => handleNavigation('/projections')}>PROJECTIONS</button>
                <button className="nav-button" onClick={() => handleNavigation('/chat')}>CHAT ROOMS</button>           
                <button className="nav-button" onClick={() => handleNavigation('/odds')}>ODDS</button>
                <button className="nav-button" onClick={() => handleNavigation('/rankings')}>LINEUP OPTIMIZER</button>
            </div>
        </nav>
    );
}

export default NavBar;