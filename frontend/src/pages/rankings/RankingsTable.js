import React from 'react';
import defaultHeadshot from '../../assets/default-headshot.png';

const RankingsTable = React.memo(({ players, onSort, sortKey, sortOrder }) => {

    return (
        <table className="rankings-table">
            <thead>
                <tr>
                    <th>RANK</th>
                    <th>PLAYER</th>
                    {Object.keys(players[0])
                        .filter(key => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key))
                        .map(key => (
                            <th key={key} onClick={() => onSort(key)}>
                                {key.replace('_', ' ').toUpperCase()}
                                {sortKey === key && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                            </th>
                        ))}
                </tr>
            </thead>
            <tbody>
                {players.map((player, index) => (
                    <tr key={player.player_id || index}>
                        <td>{index + 1}</td>
                        <td>
                            <img src={player.headshot_url || defaultHeadshot}  alt={`${player.player_name}'s headshot`} style={{ width: '60px', height: 'auto', verticalAlign: 'middle', marginRight: '10px' }} />
                            <strong>{player.player_name}</strong>
                            <span> ({player.recent_team} - {player.position})</span>
                        </td>
                        {Object.entries(player)
                            .filter(([key]) => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key))
                            .map(([key, value], valueIndex) => (
                                <td key={valueIndex}>{value}</td>
                            ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

export default RankingsTable;