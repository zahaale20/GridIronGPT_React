import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/gridirongpt_logo.png';
import './NavBar.css'; // Import the CSS file for styling

function NavBar() {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <nav className="nav">
            <Link to="/">
                <img className="logo-image" src={logoImage} alt="GridIron GPT Logo" />
            </Link>
            <div className="sections-container">
                
                <button className="dropbtn" onClick={() => handleNavigation('/rankings')}>RANKINGS</button>
                
                <button className="dropbtn" onClick={() => handleNavigation('/projections')}>PROJECTIONS</button>

                <button className="dropbtn" onClick={() => handleNavigation('/chat')}>CHAT ROOMS</button>
                
                <button className="dropbtn" onClick={() => handleNavigation('/odds')}>ODDS</button>

                <button className="dropbtn" onClick={() => handleNavigation('/rankings')}>LINEUP OPTIMIZER</button>

            </div>
        </nav>
    );
}

export default NavBar;