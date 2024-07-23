import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RankingsPage.css';
import RankingsTable from './RankingsTable';

function RankingsPage() {
    const [players, setPlayers] = useState({ QB: [], WR: [], RB: [], TE: [] });
    const [selectedPosition, setSelectedPosition] = useState('QB');
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
                    params: { sort: sortKey, order: sortOrder }
                });
                setPlayers(prevPlayers => ({
                    ...prevPlayers,
                    [selectedPosition]: response.data
                }));
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchPlayers();
    }, [selectedPosition, sortKey, sortOrder]);

    const handleSort = key => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const handlePositionChange = position => {
        setSelectedPosition(position);
        setSortKey('FPTS'); // Reset sort key to default
        setSortOrder('desc'); // Reset sort order to default
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="rankings-container" style={{ marginTop: "110px" }}>
            <h1 className="header-title">2023 Fantasy Football Rankings - {selectedPosition}</h1>
            <div className="position-links">
                {['QB', 'WR', 'RB', 'TE'].map((position, index) => (
                    <React.Fragment key={position}>
                        <a href="#" onClick={() => handlePositionChange(position)}>{position}</a>
                        {index < 3 ? ' | ' : ''}
                    </React.Fragment>
                ))}
            </div>
            
            {players[selectedPosition].length > 0 && (
                <RankingsTable
                    players={players[selectedPosition]}
                    onSort={handleSort}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                />
            )}
        </div>
    );
}

export default RankingsPage;