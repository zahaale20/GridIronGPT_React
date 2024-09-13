import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import '../rankings/RankingsPage.css';
import './DraftRankingsPage.css';
import defaultHeadshot from '../../assets/default-headshot.png';

function DraftRankingsTable({ onSelectPlayer, selectedPlayerIds, currentDraftingTeamId, teamByeWeeks, setTeamByeWeeks }) {
    const [rankings, setRankings] = useState([]);
    const [allRankings, setAllRankings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const columnGroups = {
        'Draft': [
            'BYE', 
            'ECR', 
            'SD', 
            'BEST', 
            'WORST'
        ],
        'Projections': [
            'projected_completion_percentage',
            'projected_passing_yds',
            'projected_passing_tds',
            'projected_rushing_attempts',
            'projected_rushing_yds',
            'projected_rushing_tds',
            'projected_receiving_rec',
            'projected_receiving_yds',
            'projected_receiving_tds',
            'projected_sack',
            'projected_int',
            'projected_fr',
            'projected_ff',
            'projected_td',
            'projected_safety',
            'projected_pa',
            'projected_yds_agn',
            'projected_fg',
            'projected_fga',
            'projected_xpt',
            'projected_fpts'
        ],
        'Fantasy': [
            '2024', 
            '2023'
        ]
    };

    const simplifyColumnName = (name) => {
        return name.replace('PASS_', '').replace('RUSH_', '').replace('REC_', '').replace('FNTSY_', '');
    };

    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const debouncedSearch = useDebounce(() => {
        setSearchTerm(searchInput);
    }, 300);

    const handleSearch = () => {
        debouncedSearch();
    };

    function useDebounce(value, delay) {
        const [debouncedValue, setDebouncedValue] = useState(value);
    
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
    
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]); // Only re-call effect if value or delay changes
    
        return debouncedValue;
    }

    const handlePositionChange = (event) => {
        setSelectedPosition(event.target.value);
    };

    const handleSelectPlayer = (player) => {
        onSelectPlayer(player);
        if (!selectedPlayerIds.includes(player.id)) {
            // Update the bye week record for the current drafting team
            const updatedByeWeeks = { ...teamByeWeeks };
            console.log('Before updating bye weeks:', updatedByeWeeks);
            if (!updatedByeWeeks[currentDraftingTeamId]) {
                updatedByeWeeks[currentDraftingTeamId] = {};
            }
            if (!updatedByeWeeks[currentDraftingTeamId][player.position]) {
                updatedByeWeeks[currentDraftingTeamId][player.position] = [];
            }
            updatedByeWeeks[currentDraftingTeamId][player.position].push(player.bye);
            console.log(`After adding bye week for ${player.position} of team ${currentDraftingTeamId}:`, updatedByeWeeks);
            setTeamByeWeeks(updatedByeWeeks);
        }
    };

    const isRedDotNeeded = (player) => {
        const currentTeamByeWeeks = teamByeWeeks[currentDraftingTeamId] && teamByeWeeks[currentDraftingTeamId][player.position];
        return currentTeamByeWeeks && currentTeamByeWeeks.includes(player.bye);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const positions = selectedPosition === 'ALL' ? 'all' : selectedPosition.toLowerCase();
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_LINK}/fantasy/draft-rankings/${positions}`);
                setAllRankings(response.data.map(player => ({
                    ...player,
                    id: player.PLAYER_ID || player.player_id
                })));
            } catch (err) {
                setError(`Failed to fetch data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedPosition]);

    useEffect(() => {
        const filteredRankings = allRankings.filter(player =>
            player.player_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
        );
        setRankings(filteredRankings);
    }, [searchTerm, allRankings]);

    const filteredRankings = rankings.filter(item => !selectedPlayerIds.includes(item.id));

    const top3EloPlayers = [...filteredRankings]
        .sort((a, b) => b.elo - a.elo)
        .slice(0, 3)
        .map(player => player.id);

    const top3ProjPlayers = [...filteredRankings]
        .sort((a, b) => b.projected_fpts - a.projected_fpts)
        .slice(0, 3)
        .map(player => player.id);

    const top32024Players = [...filteredRankings]
        .sort((a, b) => b.fpts_2024 - a.fpts_2024)
        .slice(0, 3)
        .map(player => player.id);

    const top32023Players = [...filteredRankings]
        .sort((a, b) => b.ffpts_2023 - a.fpts_2023)
        .slice(0, 3)
        .map(player => player.id);

    const rookies = [...filteredRankings]
        .filter(player => 
            (player.fpts_2023 === 0 || player.fpts_2023 === null) &&
            player.position !== 'DST' && player.player_name !== 'Aaron Rodgers'
        )
        .map(player => player.id);

    const headersAndFilters = (
        <>
            <div className="spacing draft-filter-container">
                <h1 className="filter-header">Players</h1>
                <input
                    type="text"
                    placeholder="Search players..."
                    className="search-input"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                />
                <button className="search-button" onClick={handleSearch}>
                    <FaSearch />
                </button>
                <div className="draft-filter-subcontainer">
                    {['ALL', 'QB', 'WR', 'RB', 'TE', 'FLEX', 'DST', 'K'].map((position) => (
                        <label key={position} className="checkbox-label">
                            <input
                                type="radio"
                                name="position"
                                value={position}
                                checked={selectedPosition === position}
                                onChange={handlePositionChange}
                            />
                            {position}
                        </label>
                    ))}
                </div>
            </div>

            <div className="header-dot-indicators">
                <span className="blue-dot"></span><span className="dot-label">Recommendation</span>
                <span className="red-dot"></span><span className="dot-label">Bye Week Overlap</span>
                <span className="green-dot"></span><span className="dot-label">Projected FPTS</span>
                <span className="orange-dot"></span><span className="dot-label">2024 FPTS</span>
                <span className="yellow-dot"></span><span className="dot-label">2023 FPTS</span>
                <span className="purple-dot"></span><span className="dot-label">Rookie</span>
            </div>

            <div className="rankings-header-container">
                <div className="column-headers">
                    <div className="rank-header header-text">RANK</div>
                    <div className="draft-player-header header-text">PLAYER</div>
                    <div className="draft-stats-header header-text">STATS</div>
                </div>
            </div>
        </>
    );

    const renderStatColumn = (value, label) => {
        // Always render these specific fields even if their values are zero or null
        const alwaysRender = ['Proj FPTS', '2023 Fpts', '2024 Fpts'];
    
        // Check if the current label is one of the special cases that should always be rendered
        if (alwaysRender.includes(label)) {
            return (
                <div className="draft-stat-column">
                    {value}<span className="draft-stat-column-label">{label}</span>
                </div>
            );
        }
    
        // For all other labels, continue checking for various forms of "zero" values
        if (value !== 0 && value !== null && value !== '' && value !== undefined && value !== '0' && value !== 0.0) {
            return (
                <div className="draft-stat-column">
                    {value}<span className="draft-stat-column-label">{label}</span>
                </div>
            );
        }
    
        return null; // Do not render the column if the value is effectively "zero"
    };

    if (loading) {
        return (
            <>
                {headersAndFilters}
                {Array(10).fill(0).map((_, index) => (
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
                ))}
            </>
        );
    }

    if (error) {
        return (
            <>
                {headersAndFilters}
                <div className="error-message">{error}</div>
            </>
        );
    }

    return (
        <div>
            {headersAndFilters}
            <div className="rankings-container">
                <div className="rankings-table">
                    {filteredRankings.map((item, index) => (
                        <div key={item.id} className="draft-player-row player-row" onClick={() => handleSelectPlayer(item)}>
                            <div className="rank-column">{index + 1}</div>
                            <div className="draft-player-column">
                                <img
                                    src={item.image_url || defaultHeadshot}
                                    alt={item.player_name}
                                    className="img-style"
                                    onError={(e) => e.target.src = defaultHeadshot}
                                />
                                <div className="player-text-container">
                                    <div className = "player-name-and-dots">
                                        <span className="player-title">{item.player_name}</span>
                                        <div className="dot-container">
                                            {top3EloPlayers.includes(item.id) && <span className="dot blue-dot"></span>}
                                            {top3ProjPlayers.includes(item.id) && <span className="dot green-dot"></span>}
                                            {top32024Players.includes(item.id) && <span className="dot orange-dot"></span>}
                                            {top32023Players.includes(item.id) && <span className="dot yellow-dot"></span>}
                                            {rookies.includes(item.id) && <span className="dot purple-dot"></span>}
                                            {isRedDotNeeded(item) && <span className="dot red-dot"></span>}
                                        </div>
                                    </div>
                                    <div className="player-subtitle">{item.team} - {item.position}</div>
                                </div>
                            </div>
                            <div className="draft-stat-column">{item.draft_bye}<span className="draft-stat-column-label">BYE</span></div>
                            <div className="draft-stat-column">{item.draft_ecr}<span className="draft-stat-column-label">ECR</span></div>
                            <div className="draft-stat-column">{item.elo}<span className="draft-stat-column-label">ELO</span></div>
                            {renderStatColumn(item.projected_completion_percentage, "Proj Cmp %")}
                            {renderStatColumn(item.projected_passing_yds, "Proj Pass Yds")}
                            {renderStatColumn(item.projected_passing_tds, "Proj Pass TDs")}
                            {renderStatColumn(item.projected_rushing_attempts, "Proj Att")}
                            {renderStatColumn(item.projected_rushing_yds, "Proj Rush Yds")}
                            {renderStatColumn(item.projected_rushing_tds, "Proj Rush TDs")}
                            {renderStatColumn(item.projected_receiving_rec, "Proj Rec")}
                            {renderStatColumn(item.projected_receiving_yds, "Proj Rec Yds")}
                            {renderStatColumn(item.projected_receiving_tds, "Proj Rec TDs")}
                            {renderStatColumn(item.projected_sack, "Proj Sacks")}
                            {renderStatColumn(item.projected_int, "Proj INTs")}
                            {renderStatColumn(item.projected_fr, "Proj Fum Rec")}
                            {renderStatColumn(item.projected_ff, "Proj Fum Frc")}
                            {renderStatColumn(item.projected_td, "Proj TDs")}
                            {renderStatColumn(item.projected_safety, "Proj Safety")}
                            {renderStatColumn(item.projected_pa, "Proj Pts Alwd")}
                            {renderStatColumn(item.projected_yds_agn, "Proj Yds Agnst")}
                            {renderStatColumn(item.projected_fg, "Proj FG")}
                            {renderStatColumn(item.projected_fga, "Proj FGA")}
                            {renderStatColumn(item.projected_xpt, "Proj XPT")}
                            {renderStatColumn(item.projected_fpts, "Proj FPTS")}
                            {renderStatColumn(item.fpts_2024, "2024 Fpts")}
                            {renderStatColumn(item.fpts_2023, "2023 Fpts")}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DraftRankingsTable;
