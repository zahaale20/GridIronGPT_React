import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RankingsPage.css';
import RankingsTable from './RankingsTable';

function RankingsPage() {
    const [players, setPlayers] = useState({ QB: [], WR: [], RB: [], TE: [], DST: [] });
    const [selectedPosition, setSelectedPosition] = useState('QB');
    const [selectedYear, setSelectedYear] = useState(2023);
    const [selectedScoring, setSelectedScoring] = useState('PPR');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortKey, setSortKey] = useState('FPTS');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const fetchPlayers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_LINK}/rankings/top-players/${selectedPosition}`, {
                    params: { sort: sortKey, order: sortOrder, year: selectedYear, scoring: selectedScoring }
                });
                setPlayers(prevPlayers => ({
                    ...prevPlayers,
                    [selectedPosition]: response.data
                }));
            } catch (err) {
                setError(`Failed to fetch data for ${selectedPosition}: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, [selectedPosition, sortKey, sortOrder, selectedYear, selectedScoring]);

    const handleSort = key => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const handlePositionChange = event => {
        setSelectedPosition(event.target.value);
        setSortKey('FPTS');
        setSortOrder('desc');
        setLoading(true);  // Reset loading state on position change
    };

    const handleYearChange = event => {
        setSelectedYear(event.target.value);
    };

    const handleScoringChange = event => {
        setSelectedScoring(event.target.value);
    };

    return (
        <div className="rankings-container">
            <div className="sticky-header">
                <p className="header-title">
                    {selectedPosition} Fantasy Football Rankings - {selectedYear}
                </p>
                <p className="header-subtitle">
                    {selectedScoring} - Top Players by Position
                </p>
                <div className="ranking-filters">
                    <div className="ranking-filter-group">
                        <label className="ranking-filter-label" htmlFor="year-select">Year</label>
                        <select id="year-select" onChange={handleYearChange} value={selectedYear}>
                            {[...Array(25)].map((_, i) => (
                                <option key={i} value={2023 - i}>
                                    {2023 - i}
                                </option>
                            ))}
                        </select>
                    </div>
    
                    <div className="ranking-filter-group">
                        <label className="ranking-filter-label" htmlFor="position-select">Position</label>
                        <select id="position-select" onChange={handlePositionChange} value={selectedPosition}>
                            {['QB', 'WR', 'RB', 'TE', 'DST'].map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>
                    </div>
    
                    <div className="ranking-filter-group">
                        <label className="ranking-filter-label" htmlFor="scoring-select">Scoring</label>
                        <select id="scoring-select" onChange={handleScoringChange} value={selectedScoring}>
                            {['Standard', 'PPR'].map((scoring) => (
                                <option key={scoring} value={scoring}>
                                    {scoring}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
    
            <RankingsTable
                players={players[selectedPosition]}
                onSort={handleSort}
                sortKey={sortKey}
                sortOrder={sortOrder}
                loading={loading}
                error={error}
            />
        </div>
    );
}

export default RankingsPage;
