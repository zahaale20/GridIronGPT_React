import React from 'react';
import defaultHeadshot from '../../assets/default-headshot.png';

const PlayerRankingsTable = ({
    players,
    loading,
    error,
    selectedYear,
    selectedPosition,
    selectedScoring,
    handlePlayerYearChange,
    handlePositionChange,
    handleScoringChange,
    handleSort,
    sortOrder,
    columnGroups,
    simplifyColumnName,
    sortKey
}) => (
    <div>
        <div className="rankings-header-container">
            <div className="rankings-title-container">
                <p className="rankings-title">Player Rankings</p>
            </div>

            <div className="filters-container">
                <div className="filter-subcontainer">
                    <label className="filter-label" htmlFor="year-select">Year</label>
                    <select id="year-select" onChange={handlePlayerYearChange} value={selectedYear}>
                        {[...Array(25)].map((_, i) => (
                            <option key={i} value={2023 - i}>
                                {2023 - i}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-subcontainer">
                    <label className="filter-label" htmlFor="position-select">Position</label>
                    <select id="position-select" onChange={handlePositionChange} value={selectedPosition}>
                        {['ALL', 'QB', 'WR', 'RB', 'TE'].map((position) => (
                            <option key={position} value={position}>
                                {position}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-subcontainer">
                    <label className="filter-label" htmlFor="scoring-select">Scoring</label>
                    <select id="scoring-select" onChange={handleScoringChange} value={selectedScoring}>
                        {['Standard', 'PPR'].map((scoring) => (
                            <option key={scoring} value={scoring}>
                                {scoring}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="column-headers">
                <div className="rank-header header-text">RANK</div>
                <div className="player-header header-text">PLAYER</div>
                {Object.entries(columnGroups).map(([group, stats]) => (
                    <div key={group} className="stats-group">
                        <div className="header-text group-text">{group}</div>
                        <div className="stat-headers-container">
                            {stats.map(stat => (
                                <div key={stat} className="stat-header header-text" onClick={() => handleSort(stat)}>
                                    {simplifyColumnName(stat)}
                                    {sortKey === stat && (sortOrder === 'desc' ? ' ↓' : ' ↑')}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="rankings-table">
            {loading ? (
                // Render skeleton loaders while loading
                Array(10).fill(0).map((_, index) => (
                    <div key={index} className="player-row skeleton-loader-row">
                        <div className="rank-column"></div>
                        <div className="player-column">
                            <div className="img-style" />
                            <div className="player-text-container">
                                <div className="player-title"></div>
                                <div className="player-subtitle"></div>
                            </div>
                        </div>
                        {Array(5).fill(0).map((_, idx) => (
                            <div key={idx} className="stat-column"></div>
                        ))}
                    </div>
                ))
            ) : error ? (
                <div className="error-message">Error: {error}</div>
            ) : (
                players.map((player, index) => (
                    <div key={player.player_id || index} className="player-row">
                        <div className="rank-column">{index + 1}</div>
                        <div className="player-column">
                            <img
                                src={player.headshot_url || defaultHeadshot}
                                alt={`${player.player_name}'s headshot`}
                                className="img-style"
                                onError={(e) => { e.target.src = defaultHeadshot; }}
                            />
                            <div className = "player-text-container">
                                <div className = "player-title">{player.player_name}</div>
                                <div className = "player-subtitle">{player.team_initials} - {player.position}</div>
                            </div>
                        </div>
                        {Object.keys(players[0]).filter(key => 
                            !['headshot_url', 'player_name', 'team_initials', 'position'].includes(key)
                        ).map(key => (
                            <div key={key} className="stat-column">{player[key]}</div>
                        ))}
                    </div>
                ))
            )}
        </div>
    </div>
);

export default PlayerRankingsTable;