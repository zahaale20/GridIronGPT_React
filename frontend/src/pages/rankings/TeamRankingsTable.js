import React from 'react';
import defaultTeamIcon from '../../assets/default-team-icon.png';


const offenseColumnGroups = {
    'Passing': ['PASS_COMP', 'PASS_ATT', 'PASS_YDS', 'PASS_TD', 'PASS_INT'],
    'Rushing': ['RUSH_CAR', 'RUSH_YDS', 'RUSH_TD', 'RUSH_FUM'],
    'Receiving': ['REC_REC', 'REC_TAR', 'REC_YDS', 'REC_TD'],
    'Fantasy': ['FNTSY_FPTS']
};

const defenseColumnGroups = {
    'Defense': ['DEF_FPTS', 'DEF_AVG_FPTS', 'DEF_TD', 'DEF_INT', 'DEF_SCK', 'DEF_QB_HITS', 'DEF_FR', 'DEF_SFTY', 'DEF_TCKL'],
    'Opponent': ['OPP_FPTS', 'OPP_AVG_FPTS', 'OPP_TD', 'OPP_PA', 'OPP_YA' ]
};

const simplifyColumnName = (name) => {
    return name.replace('PASS_', '').replace('RUSH_', '').replace('REC_', '').replace('DEF_', '').replace('FNTSY_', '').replace('OPP_', '');
};

const TeamRankingsTable = ({
    teams, loading, error,
    selectedYear, selectedTeamCategory, selectedScoring,
    handleTeamYearChange, handleTeamCategoryChange, handleScoringChange, handleSort,
    sortOrder, sortKey
}) => {
    const columnGroups = selectedTeamCategory === 'Defense' ? defenseColumnGroups : offenseColumnGroups;

    return (
        <div>
            <div className="rankings-header-container">
                <div className="rankings-title-container">
                    <p className="rankings-title">
                        Team Rankings ({selectedTeamCategory})
                    </p>
                </div>

                <div className="filters-container">
                    <div className="filter-subcontainer">
                        <label className="filter-label" htmlFor="year-select">Year</label>
                        <select id="year-select" onChange={handleTeamYearChange} value={selectedYear}>
                            {[...Array(25)].map((_, i) => (
                                <option key={i} value={2024 - i}>
                                    {2024 - i}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-subcontainer">
                        <label className="filter-label" htmlFor="position-select">Category</label>
                        <select id="position-select" onChange={handleTeamCategoryChange} value={selectedTeamCategory}>
                            {['Offense', 'Defense'].map((position) => (
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
                    <div className="player-header header-text">TEAM</div>
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
                    teams.map((team, index) => (
                        <div key={team.team_id || index} className="player-row">
                            <div className="rank-column">{index + 1}</div>
                            <div className="player-column">
                                <img
                                    src={team.image_url || defaultTeamIcon}
                                    alt={`${team.team_name}'s icon`}
                                    className="img-style"
                                    onError={(e) => { e.target.src = defaultTeamIcon; }}
                                />
                                <div className = "player-text-container">
                                    <div className = "player-title">{team.name}</div>
                                </div>
                            </div>
                            {Object.keys(teams[0]).filter(key => 
                                !['image_url','team_id', 'name'].includes(key)
                            ).map(key => (
                                <div key={key} className="stat-column">{team[key]}</div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamRankingsTable;


