import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RankingsPage.css';
import PlayerRankingsTable from './PlayerRankingsTable';
import TeamRankingsTable from './TeamRankingsTable';

function RankingsPage() {

    const [players, setPlayers] = useState({ ALL: [], QB: [], WR: [], RB: [], TE: [] });
    const [teamCategories, setTeamCategories] = useState({Offense: [], Defense: [] });
    const [selectedPosition, setSelectedPosition] = useState('ALL');
    const [selectedTeamCategory, setSelectedTeamCategory] = useState('Offense');
    const [selectedPlayerYear, setSelectedPlayerYear] = useState(2024);
    const [selectedTeamYear, setSelectedTeamYear] = useState(2024);
    const [selectedScoring, setSelectedScoring] = useState('PPR');
    const [columns, setColumns] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortKey, setSortKey] = useState('FNTSY_FPTS');
    const [sortOrder, setSortOrder] = useState('desc');
    const [teamSortKey, setTeamSortKey] = useState('FNTSY_FPTS');
    const [teamSortOrder, setTeamSortOrder] = useState('desc');

    const columnGroups = {
        'Passing': ['PASS_COMP', 'PASS_ATT', 'PASS_YDS', 'PASS_TD', 'PASS_INT'],
        'Rushing': ['RUSH_CAR', 'RUSH_YDS', 'RUSH_TD', 'RUSH_FUM'],
        'Receiving': ['REC_REC', 'REC_TAR','REC_YDS', 'REC_TD'],
        'Fantasy': ['FNTSY_FPTS']
    };

    const simplifyColumnName = (name) => {
        return name.replace('PASS_', '').replace('RUSH_', '').replace('REC_', '').replace('FNTSY_', '');
    };

    const handlePlayerYearChange = (event) => {
        setSelectedPlayerYear(event.target.value);
    };

    const handleTeamYearChange = (event) => {
        setSelectedTeamYear(event.target.value);
    };

    const handlePositionChange = (event) => {
        setSelectedPosition(event.target.value);
    };

    const handleTeamCategoryChange = (event) => {
        const newCategory = event.target.value;
        setSelectedTeamCategory(newCategory);
        
        if (newCategory === 'Defense') {
            setTeamSortKey('DEF_FPTS');
        } else {
            setTeamSortKey('FNTSY_FPTS');
        }
    };

    const handleScoringChange = (event) => {
        setSelectedScoring(event.target.value);
    };

    const handleSort = (newSortKey) => {
        if (sortKey === newSortKey) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(newSortKey);
            setSortOrder('desc');  // Default to descending when changing sort criteria
        }
    };
    
    const handleTeamSort = (newSortKey) => {
        if (teamSortKey === newSortKey) {
            setTeamSortOrder(teamSortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setTeamSortKey(newSortKey);
            setTeamSortOrder('desc');  // Default to descending when changing sort criteria
        }
    };

    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            setError(null);
            try {
                const encodedSortKey = encodeURIComponent(sortKey);
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_LINK}/rankings/top-players/${selectedPosition}`, {
                    params: { sort: encodedSortKey, order: sortOrder, year: selectedPlayerYear, scoring: selectedScoring }
                });

                setPlayers(prevPlayers => ({
                    ...prevPlayers,
                    [selectedPosition]: response.data
                }));
                if (response.data && response.data.length > 0) {
                    setColumns(Object.keys(response.data[0]));
                }
            } catch (err) {
                setError(`Failed to fetch data for ${selectedPosition}: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, [selectedPosition, sortKey, sortOrder, selectedPlayerYear, selectedScoring]);


    useEffect(() => {
        const fetchTeams = async () => {
            setLoading(true);
            setError(null);
            try {
                const encodedTeamSortKey = encodeURIComponent(teamSortKey);
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_LINK}/rankings/top-teams/${selectedTeamCategory.toLowerCase()}`, {
                    params: { sort: encodedTeamSortKey, order: teamSortOrder, year: selectedTeamYear, scoring: selectedScoring }
                });
                setTeamCategories({
                    ...teamCategories,
                    [selectedTeamCategory]: response.data
                });
            } catch (err) {
                console.error(`Failed to fetch team data: ${err.message}`);
                setError(`Failed to fetch team data: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [selectedTeamCategory, selectedTeamYear, selectedScoring, teamSortKey, teamSortOrder,]);

    return (
        <div className="rankings-page">
            <div className ="vertical-scroll-container">
                <div className="rankings-double-container">
                    <div className="rankings-single-container">

                        <PlayerRankingsTable
                            players={players[selectedPosition] || []}
                            selectedPosition={selectedPosition}
                            selectedYear={selectedPlayerYear}
                            selectedScoring={selectedScoring}
                            handlePositionChange={(event) => setSelectedPosition(event.target.value)}
                            handlePlayerYearChange={(event) => setSelectedPlayerYear(event.target.value)}
                            handleScoringChange={(event) => setSelectedScoring(event.target.value)}
                            handleSort={handleSort}
                            sortOrder={sortOrder}
                            loading={loading}
                            error={error}
                            columnGroups={columnGroups}
                            simplifyColumnName={simplifyColumnName}
                            sortKey={sortKey}
                        />
                    </div>

                    <div className="rankings-single-container">
                        <TeamRankingsTable
                            teams={teamCategories[selectedTeamCategory] || []}
                            selectedYear={selectedTeamYear}
                            selectedScoring={selectedScoring}
                            selectedTeamCategory={selectedTeamCategory}
                            handleTeamYearChange={handleTeamYearChange}
                            handleTeamCategoryChange={handleTeamCategoryChange}
                            handleScoringChange={handleScoringChange}
                            handleSort={handleTeamSort}
                            sortOrder={teamSortOrder}
                            loading={loading}
                            error={error}
                            columnGroups={columnGroups}
                            simplifyColumnName={simplifyColumnName}
                            sortKey={teamSortKey}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RankingsPage;
