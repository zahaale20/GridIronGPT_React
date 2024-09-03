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
            p.player_name as player_name,
            p.position as position,
            p.headshot_url as headshot_url,
            t.initials as team_initials,
            sum(p.completions) AS PASS_COMP,
            sum(p.attempts) AS PASS_ATT,
            sum(p.passing_yards) as PASS_YDS,
            sum(p.passing_tds) as PASS_TD,
            sum(p.interceptions) as PASS_INT,
            sum(p.carries) as RUSH_CAR,
            sum(p.rushing_yards) as RUSH_YDS,
            sum(p.rushing_tds) as RUSH_TD,
            sum(p.rushing_fumbles + p.receiving_fumbles + p.sack_fumbles) as RUSH_FUM,
            sum(receptions) as REC_REC,
            sum(p.targets) as REC_TAR,
            sum(p.receiving_yards) as REC_YDS,
            sum(p.receiving_tds) as REC_TD,
            round(sum(fantasy_points_ppr)::numeric, 1) as FNTSY_FPTS
        FROM
            offense_stats p
            join teams t on p.recent_team = t."teamID"
        WHERE 
            p.season = 2023 AND 
            p.position = 'WR'
        GROUP BY 
            p.player_name, p.position, p.recent_team, p.headshot_url, t.initials
        ORDER BY 
            round(sum(fantasy_points_ppr)::numeric, 1) DESC;
        `.trim();

        setSqlQuery(initialQuery);
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
      setSqlQuery(data.sqlQuery);
    } catch (error) {
      console.error('Error fetching SQL query:', error);
      setSqlQuery('Error generating SQL query.');
    }
  };

  return (
    <div className="rankings-page">
      <div className ="vertical-scroll-container">
        <SearchBar onSearchTerm={handleResults} />
        {sqlQuery && <ResultsDisplay userInput={userInput} sqlQuery={sqlQuery} />}
      </div>
    </div>
  );
}

export default HomePage;