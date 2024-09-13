import React from 'react';
import '../rankings/RankingsPage.css';
import defaultHeadshot from '../../assets/default-headshot.png';

function PlayerDetails({ player, onDeselectPlayer, pickNumber }) {
    const handleClick = () => {
        onDeselectPlayer(player.id);
    };

    return (
        <div className="player-details player-column" onClick={handleClick}>
            <div className="pick-number">{pickNumber}</div>
            <img
                src={player.image_url || defaultHeadshot}
                alt={player.player_name}
                className="img-style"
                onError={(e) => e.target.src = defaultHeadshot}
            />
            <div className="player-text-container">
                <div className="player-title">{player.player_name}</div>
                <div className="player-subtitle">{player.team} - {player.position}</div>
            </div>
        </div>
    );
}

export default PlayerDetails;