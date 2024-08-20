import React from 'react';
import defaultHeadshot from '../../assets/default-headshot.png';

const RankingsTable = React.memo(({ players, onSort, sortKey, sortOrder, loading, error }) => {
    const getTeamInitials = (teamId) => {
        const teamMap = {
            1: "ARI", 2: "ATL", 3: "BAL", 4: "BUF", 5: "CAR", 6: "CHI",
            7: "CIN", 8: "CLE", 9: "DAL", 10: "DEN", 11: "DET", 12: "GB",
            13: "HOU", 14: "IND", 15: "JAX", 16: "KC", 17: "LV", 18: "LAC",
            19: "LAR", 20: "MIA", 21: "MIN", 22: "NE", 23: "NO", 24: "NYG",
            25: "NYJ", 26: "PHI", 27: "PIT", 28: "SF", 29: "SEA", 30: "TB",
            31: "TEN", 32: "WAS"
        };
        return teamMap[teamId] || "Unknown";
    };

    const columnCount = players.length > 0
        ? Object.keys(players[0]).filter(key => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key)).length + 2
        : 2;

    const skeletonRows = [...Array(10)].map((_, index) => (
        <tr key={`skeleton-${index}`} className="skeleton-row">
            <td colSpan={columnCount} className="skeleton-full-row">
                <div className="skeleton-loader"></div>
            </td>
        </tr>
    ));

    return (
        <table className="rankings-table">
            <thead>
                <tr>
                    <th className="rank-column">RANK</th>
                    <th className="player-column">PLAYER</th>
                    {players.length > 0 &&
                        Object.keys(players[0])
                            .filter(key => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key))
                            .map(key => (
                                <th
                                    key={key}
                                    className="stat-column"
                                    onClick={() => onSort(key)}
                                >
                                    {key.replace('_', ' ').toUpperCase()}
                                    {sortKey === key && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                                </th>
                            ))}
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    skeletonRows
                ) : error ? (
                    <tr><td colSpan={columnCount}>Error: {error}</td></tr>
                ) : (
                    players.map((player, index) => (
                        <tr key={player.player_id || index}>
                            <td className="rank-column">{index + 1}</td>
                            <td className="player-column">
                                <div className="player-info-style">
                                    <img
                                        loading="lazy"
                                        src={player.headshot_url || defaultHeadshot}
                                        alt={`${player.player_name}'s headshot`}
                                        className="img-style"
                                        onError={(e) => e.target.src = defaultHeadshot}
                                    />
                                    <div>
                                        <strong>{player.player_name}</strong>
                                        <div className="player-details-style">{getTeamInitials(player.recent_team)} - {player.position}</div>
                                    </div>
                                </div>
                            </td>
                            {Object.entries(player)
                                .filter(([key]) => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key))
                                .map(([key, value], valueIndex) => (
                                    <td key={valueIndex} className="stat-column">{value}</td>
                                ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
});

export default RankingsTable;
