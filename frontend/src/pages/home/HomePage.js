import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from './main/SearchBar';
import ResultsDisplay from './main/ResultsDisplay';
import './HomePage.css';

function HomePage() {
  const [userInput, setUserInput] = useState('What are the top wide receivers of 2023 based on receiving yards?');
  const [sqlQuery, setSqlQuery] = useState('');

  // Automatically run the initialize endpoint on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_LINK}/openai/initialize`);
        console.log("Initial data fetched:", response.data);

        // Set the SQL query to trigger the data fetching in ResultsDisplay
        const initialQuery = `
        SELECT 
            player_name,
            position,
            headshot_url,
            recent_team,
            sum(receptions) as REC,
            sum(targets) as TAR,
            sum(receiving_yards) as REC_YDS,
            sum(receiving_tds) as REC_TD,
            sum(carries) as CAR,
            sum(rushing_yards) as RUSH_YDS,
            sum(rushing_tds) as RUSH_TD,
            round(sum(fantasy_points_ppr)::numeric, 2) as FPTS
        FROM 
            players
        WHERE 
            season = 2023 AND position = 'WR'
        GROUP BY 
            player_name, position, recent_team, headshot_url
        ORDER BY 
            SUM(receiving_yards) DESC;
        `.trim();

        setSqlQuery(initialQuery);  // Trigger the query to be used in ResultsDisplay
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleResults = async (searchTerm) => {
    console.log("Search submitted with term:", searchTerm);
    setUserInput(searchTerm);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_LINK}/openai/search`, {
        userQuery: searchTerm
      });

      const data = response.data;
      setSqlQuery(data.sqlQuery); // Update the SQL query for the new search term
    } catch (error) {
      console.error('Error fetching SQL query:', error);
      setSqlQuery('Error generating SQL query.');
    }
  };

  return (
    <div className="homepage-container">
      <div className="main-content">
        <SearchBar onSearchTerm={handleResults} />
        {sqlQuery && <ResultsDisplay userInput={userInput} sqlQuery={sqlQuery} />}
      </div>
    </div>
  );
}

export default HomePage;