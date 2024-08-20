import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultHeadshot from '../../../assets/default-headshot.png'; // Assuming you have a default image
import './ResultsDisplay.css';
import '../../rankings/RankingsPage.css';

function ResultsDisplay({ userInput, sqlQuery }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const cleanSqlQuery = (query) => {
        if (!query) return '';
        return query.replace(/^```sql\s*/, '').replace(/```$/, '');
    };

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

    useEffect(() => {
        const fetchData = async () => {
            const cleanedQuery = cleanSqlQuery(sqlQuery);
            if (!cleanedQuery) {
                console.log("No valid SQL query provided, skipping fetch.");
                return;
            }

            console.log("Starting data fetch with SQL query:", cleanedQuery);
            setLoading(true);

            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_LINK}/openai/execute-query`, { sqlQuery: cleanedQuery });
                console.log("Data fetched successfully:", response.data);
                setData(response.data);
            } catch (err) {
                console.error("Error fetching data:", err.message);
                setError(err.message);
            } finally {
                console.log("Data fetch process complete.");
                setLoading(false);
            }
        };

        fetchData();
    }, [sqlQuery]);

    if (loading) {
        console.log("Loading data...");
        return <p>Loading...</p>;
    }
    if (error) {
        console.error("Error detected:", error);
        return <p>Error: {error}</p>;
    }
    if (!data.length) {
        console.log("No data found for the query:", sqlQuery);
        return <p>No data found.</p>;
    }

    console.log("Rendering data in table format.");
    return (
        <div className="rankings-container" style={{marginTop: '20px'}}>
            <p>{userInput}</p>
            <table className="rankings-table" style = {{marginTop: '20px'}}>
                <thead>
                    <tr>
                        <th className="rank-column">RANK</th>
                        <th className="player-column">PLAYER</th>
                        {Object.keys(data[0])
                            .filter(key => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key))
                            .map((key, idx) => (
                                <th key={idx} className="stat-column">{key.replace('_', ' ').toUpperCase()}</th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((player, index) => (
                        <tr key={index}>
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
                                        <div className="player-details-style">
                                            {getTeamInitials(player.recent_team)} - {player.position}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            {Object.entries(player)
                                .filter(([key]) => !['headshot_url', 'player_name', 'recent_team', 'position'].includes(key))
                                .map(([key, value], valueIndex) => (
                                    <td key={valueIndex} className="stat-column">{value}</td>
                                ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ResultsDisplay;
