const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { Pool } = require("pg");
require("dotenv").config();

// Initialize OpenAI API with the new SDK pattern
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const connectionString = process.env.DB_CONNECTION_STRING;

// Create connection pool to connect to the database.
function createConnection() {
    const pool = new Pool({
        connectionString: connectionString
    });

    return pool;
}

router.get("/initialize", async (req, res) => {
    const connection = createConnection();

    try {
        const { rows } = await connection.query(`
            SELECT 
                player_name, 
                position, 
                recent_team, 
                headshot_url, 
                SUM(receiving_yards) AS "REC YDS", 
                SUM(receptions) AS "REC", 
                SUM(targets) AS "TGT", 
                SUM(receiving_tds) AS "REC TDS", 
                SUM(receiving_fumbles) AS "REC FUMB", 
                SUM(receiving_first_downs) AS "REC FD", 
                AVG(receiving_epa) AS "REC EPA", 
                AVG(target_share) AS "TGT SHARE", 
                AVG(air_yards_share) AS "AIR YDS SHARE", 
                AVG(wopr) AS "WOPR", 
                SUM(special_teams_tds) AS "ST TDS", 
                SUM(fantasy_points) AS "FPTS", 
                AVG(fantasy_points_ppr) AS "FPTS PPR"
            FROM 
                players
            WHERE 
                season = 2023 AND 
                position = 'WR'
            GROUP BY 
                player_name, position, recent_team, headshot_url
            ORDER BY 
                SUM(receiving_yards) DESC;

      `);
        console.log(rows);

        res.status(200).send(rows);
        await connection.end();
    } catch (error) {
        console.error("An error occurred while fetching team matchup data:", error);
        res.status(500).send("An error occurred while fetching team matchup data");
    }
});

// Route to handle English to SQL translation using OpenAI
router.post("/search", async (req, res) => {
    const { userQuery } = req.body; // Make sure you're using body-parser or express.json()

    if (!userQuery) {
        return res.status(400).json({ error: "No query provided" });
    }

    try {
        console.log("Received query for translation:", userQuery);

        const prompt = `
            Given these column names from table 'players': player_id	player_name	position	position_group	headshot_url	recent_team	season	week	season_type	opponent_team	completions	attempts	passing_yards	passing_tds	interceptions	sacks	sack_yards	sack_fumbles	sack_fumbles_lost	passing_air_yards	passing_yards_after_catch	passing_first_downs	passing_epa	passing_2pt_conversions	pacr	dakota	carries	rushing_yards	rushing_tds	rushing_fumbles	rushing_fumbles_lost	rushing_first_downs	rushing_epa	rushing_2pt_conversions	receptions	targets	receiving_yards	receiving_tds	receiving_fumbles	receiving_fumbles_lost	receiving_air_yards	receiving_yards_after_catch	receiving_first_downs	receiving_epa	receiving_2pt_conversions	racr	target_share	air_yards_share	wopr	special_teams_tds	fantasy_points	fantasy_points_ppr	pt_id
            Here is an example row: 00-0033891	Zay Jones	WR	WR	https://static.www.nfl.com/image/private/f_auto,q_auto/league/pbmcmjxxjcrandbjmey7	4	2018	13	REG	20	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	0	4	9	67	2	0	0	166	5	3	4.77060794830322	1	0.403614461421967	0.321428567171097	0.408867001533508	0.768349766731262	0	20.7000007629395	24.7000007629395	144726
            Write a PostgreSQL query that answers this question: ${userQuery}
            Use all columns relevant to the player's position to write the query. Show only the query and no other comments. Consider that each row consists of ONLY WEEKLY player stats, therefore group by player_name and calculate the SUM and AVG. Rename column names, EXCLUDING player_name, recent_team, position, and headshot_url to be all capitalized, surrounded by quotes if the name has multiple words, simple, and abbreviated (EX: receiving_yards to 'REC YDS'). Do not use the round function.  Do not set a limit on how many entries to display. Ensure you are returning just the query, with no extra characters. Display the player's name, THEN position, THEN recent team, and headshot_URL first, and then the remaining relevant columns to the players position in order by the aggregate function, not the alias.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that translates natural language queries into optimized SQL queries." },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: 500
        });

        const sqlQuery = completion.choices[0].message.content.trim();

        console.log("Generated SQL query:", sqlQuery);

        res.json({ sqlQuery });
    } catch (error) {
        console.error("Failed to fetch from OpenAI:", error);
        res.status(500).json({
            error: "Failed to process the request",
            message: error.message || "Unknown error"
        });
    }
});

router.post("/execute-query", async (req, res) => {
    const { sqlQuery } = req.body;

    if (!sqlQuery) {
        return res.status(400).json({ error: "No SQL query provided" });
    }

    const connection = createConnection();

    try {
        const { rows } = await connection.query(sqlQuery);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).json({
            error: "Failed to execute SQL query",
            message: error.message || "Unknown error"
        });
    } finally {
        await connection.end();
    }
});

module.exports = router;