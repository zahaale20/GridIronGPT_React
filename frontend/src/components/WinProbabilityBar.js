import React from 'react';
import './WinProbabilityBar.css';

const WinProbabilityBar = ({ homeProbability, awayProbability, homeColor, awayColor }) => {
    
    //console.log("Rendering WinProbabilityBar with:", { homeProbability, awayProbability });

    return (
        <div className="win-probability-bar">
            <div
                className="win-probability-segment"
                style={{ width: `${awayProbability}%`, backgroundColor: awayColor }}
            >
                {awayProbability > 15 && <span className="win-probability-label">{awayProbability}%</span>}
            </div>
            <div
                className="win-probability-segment"
                style={{ width: `${homeProbability}%`, backgroundColor: homeColor }}
            >
                {homeProbability > 15 && <span className="win-probability-label">{homeProbability}%</span>}
            </div>
        </div>
    );
};

export default WinProbabilityBar;