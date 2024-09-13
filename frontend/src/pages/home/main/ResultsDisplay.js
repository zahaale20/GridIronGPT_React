import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResultsDisplayTable from './ResultsDisplayTable';
import './ResultsDisplay.css';
import '../../rankings/RankingsPage.css';

function ResultsDisplay({ userInput, sqlQuery }) {
    const [players, setPlayers] = useState({ ALL: [], QB: [], WR: [], RB: [], TE: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const columnGroups = {
        'Passing': ['PASS_COMP', 'PASS_ATT', 'PASS_YDS', 'PASS_TD', 'PASS_INT'],
        'Rushing': ['RUSH_CAR', 'RUSH_YDS', 'RUSH_TD', 'RUSH_FUM'],
        'Receiving': ['REC_REC', 'REC_TAR','REC_YDS', 'REC_TD'],
        'Fantasy': ['FNTSY_FPTS']
    };

    const simplifyColumnName = (name) => {
        return name.replace('PASS_', '').replace('RUSH_', '').replace('REC_', '').replace('FNTSY_', '');
    };

    useEffect(() => {
        const fetchData = async () => {
            const cleanedQuery = sqlQuery.replace(/```sql|```/g, '').trim();
            if (!cleanedQuery) {
                console.error("No valid SQL query provided, skipping fetch.");
                return;
            }

            setLoading(true);
            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_LINK}/openai/execute-query`, { sqlQuery: cleanedQuery });

                setPlayers(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sqlQuery]);

    return (
        <div className="rankings-container" style={{ marginTop: '20px' }}>
            <div className="search-result-container">
                <p className="search-result-text">"{userInput}"</p>
            </div>

            <ResultsDisplayTable
                players={players || []}
                loading={loading}
                error={error}
                columnGroups={columnGroups}
                simplifyColumnName={simplifyColumnName}
            />
        </div>
    );
}

export default ResultsDisplay;
